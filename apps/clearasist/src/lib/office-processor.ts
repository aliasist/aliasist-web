import JSZip from 'jszip';

export interface ProcessedOffice {
  originalFile: File;
  cleanedBlob: Blob;
  originalSize: number;
  cleanedSize: number;
  removedItems: { label: string; value?: string }[];
  removedCount: number;
}

const CORE_FIELDS = [
  'dc:creator',
  'cp:lastModifiedBy',
  'dcterms:created',
  'dcterms:modified',
  'cp:lastPrinted',
  'cp:revision',
  'dc:title',
  'dc:subject',
  'dc:keywords',
  'dc:description',
];

const APP_FIELDS = [
  'Company',
  'Manager',
  'HyperlinkBase',
  'Application',
  'DocSecurity',
];

export async function processOffice(file: File): Promise<ProcessedOffice> {
  const originalSize = file.size;
  const zip = await JSZip.loadAsync(file);
  const removed: { label: string; value?: string }[] = [];

  // === Handle core.xml (most important metadata) ===
  const coreFile = zip.file('docProps/core.xml');
  if (coreFile) {
    const coreContent = await coreFile.async('string');
    
    // Simple but effective stripping of common fields
    let cleanedCore = coreContent;

    CORE_FIELDS.forEach(field => {
      // Match both <dc:creator>...</dc:creator> and <cp:lastModifiedBy>...</cp:lastModifiedBy>
      const regex = new RegExp(`<${field}[^>]*>.*?</${field}>`, 'gs');
      const matches = coreContent.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const value = match.replace(/<[^>]+>/g, '').trim();
          if (value) {
            removed.push({ label: field, value });
          }
        });
        cleanedCore = cleanedCore.replace(regex, '');
      }
    });

    zip.file('docProps/core.xml', cleanedCore);
  }

  // === Handle app.xml ===
  const appFile = zip.file('docProps/app.xml');
  if (appFile) {
    let appContent = await appFile.async('string');

    APP_FIELDS.forEach(field => {
      const regex = new RegExp(`<${field}[^>]*>.*?</${field}>`, 'gs');
      const matches = appContent.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const value = match.replace(/<[^>]+>/g, '').trim();
          if (value) {
            removed.push({ label: `App.${field}`, value });
          }
        });
        appContent = appContent.replace(regex, '');
      }
    });

    zip.file('docProps/app.xml', appContent);
  }

  // === Remove custom.xml entirely (very common source of sensitive custom properties) ===
  const customFile = zip.file('docProps/custom.xml');
  if (customFile) {
    removed.push({ label: 'Custom Properties (entire file)' });
    zip.remove('docProps/custom.xml');
    
    // Also try to remove its relationship file if it exists
    zip.remove('docProps/_rels/custom.xml.rels');
  }

  // Generate the cleaned file
  const cleanedBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    originalFile: file,
    cleanedBlob,
    originalSize,
    cleanedSize: cleanedBlob.size,
    removedItems: removed,
    removedCount: removed.length,
  };
}
