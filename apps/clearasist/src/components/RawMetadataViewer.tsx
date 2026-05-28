import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RawMetadataViewerProps {
  before: any;
  after: any;
}

export function RawMetadataViewer({ before, after }: RawMetadataViewerProps) {
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filterData = (data: any): any => {
    if (!search) return data;
    const lower = search.toLowerCase();

    const recurse = (obj: any, path: string = ''): any => {
      if (obj === null || obj === undefined) return null;

      if (typeof obj === 'object') {
        const result: any = {};
        let hasMatch = false;

        for (const [k, v] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${k}` : k;
          const strValue = typeof v === 'object' ? JSON.stringify(v) : String(v);

          if (currentPath.toLowerCase().includes(lower) || strValue.toLowerCase().includes(lower)) {
            result[k] = v;
            hasMatch = true;
          } else if (typeof v === 'object') {
            const nested = recurse(v, currentPath);
            if (nested && Object.keys(nested).length > 0) {
              result[k] = nested;
              hasMatch = true;
            }
          }
        }
        return hasMatch ? result : null;
      }
      return obj;
    };

    const res = recurse(data);
    return res || {};
  };

  const renderSection = (key: string, data: any, isBefore: boolean) => {
    const isExpanded = expandedSections[`${isBefore ? 'before' : 'after'}-${key}`] ?? true;
    const filtered = filterData(data);

    if (Object.keys(filtered).length === 0 && search) return null;

    return (
      <div key={key} className="mb-2 border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(`${isBefore ? 'before' : 'after'}-${key}`)}
          className="w-full flex items-center justify-between px-3 py-2 bg-secondary text-left text-xs font-mono uppercase tracking-[0.16em]"
        >
          <span>{key}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {isExpanded && (
          <pre className="p-3 text-[10px] bg-background overflow-auto max-h-64 whitespace-pre-wrap font-mono">
            {JSON.stringify(filtered, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  const beforeSections = before ? Object.keys(before) : [];
  const afterSections = after ? Object.keys(after) : [];

  return (
    <div>
      <input
        type="text"
        placeholder="Search metadata keys or values..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-3 px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:border-electric"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">Before</div>
          {beforeSections.length > 0 ? (
            beforeSections.map(key => renderSection(key, before[key], true))
          ) : (
            <div className="text-xs text-muted-foreground">No metadata found</div>
          )}
        </div>

        {/* After */}
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">After Cleaning</div>
          {afterSections.length > 0 ? (
            afterSections.map(key => renderSection(key, after[key], false))
          ) : (
            <div className="text-xs text-electric">✓ No metadata remaining</div>
          )}
        </div>
      </div>
    </div>
  );
}
