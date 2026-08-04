# WebMCP (navigator.modelContext) guide

To expose simple tools to in-browser AI agents, add a small script on the homepage that registers tools via the Model Context API (if available):

```js
if (window.navigator && navigator.modelContext && navigator.modelContext.provideContext) {
  navigator.modelContext.provideContext({
    tools: [
      {
        name: "search-aliasist",
        description: "Search the Aliasist knowledge base",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } }
        },
        execute: async (args) => {
          const res = await fetch(`/api/search?q=${encodeURIComponent(args.query)}`);
          return res.json();
        }
      }
    ]
  });
}
```

This is progressive enhancement — it will do nothing on browsers that don't implement the API.
