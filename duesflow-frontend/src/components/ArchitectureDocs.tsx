/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DELIVERABLE_DOCS } from '../data/docs';
import { Search, FileText, Database, Shield, Server, ArrowRight, Check, Copy } from 'lucide-react';

export default function ArchitectureDocs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDocId, setSelectedDocId] = useState<string>(DELIVERABLE_DOCS[0].id);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const categories = ['All', 'architecture', 'database', 'api', 'security', 'infrastructure'];

  const filteredDocs = DELIVERABLE_DOCS.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.markdown.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedDoc = DELIVERABLE_DOCS.find(d => d.id === selectedDocId) || DELIVERABLE_DOCS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Simple and highly robust lightweight Markdown-to-HTML parser that supports headers, lists, code, and tables nicely styled.
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLang = '';
    let inTable = false;
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length === 0) return null;
      const headers = tableRows[0];
      const rows = tableRows.slice(2); // Skip separator row
      
      const el = (
        <div key={`table-${key}`} className="my-6 overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold text-slate-300 font-sans">{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-300 font-mono text-xs">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
      return el;
    };

    lines.forEach((line, index) => {
      // Code Block handling
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const fullCode = codeContent.join('\n');
          const codeId = `code-${index}`;
          elements.push(
            <div key={index} className="relative my-6 group rounded-lg overflow-hidden border border-slate-800 font-mono text-xs shadow-2xl bg-slate-950">
              <div className="flex justify-between items-center bg-slate-900/90 px-4 py-2 text-slate-400 text-[10px] select-none border-b border-slate-800">
                <span>{codeLang.toUpperCase() || 'SPECIFICATION'}</span>
                <button
                  id={`btn-copy-${codeId}`}
                  onClick={() => handleCopy(fullCode, codeId)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-0.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-sm"
                >
                  {copiedText === codeId ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-400 leading-relaxed font-mono max-h-[600px]">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
          codeContent = [];
          codeLang = '';
        } else {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Table handling
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
        tableRows.push(cells);
        return;
      } else if (inTable) {
        const tableEl = flushTable(index);
        if (tableEl) elements.push(tableEl);
      }

      // Headings
      if (line.trim().startsWith('###')) {
        elements.push(
          <h3 key={index} id={`h3-${index}`} className="text-lg font-bold text-slate-100 tracking-tight mt-8 mb-3 border-l-3 border-blue-500 pl-3">
            {line.replace('###', '').trim()}
          </h3>
        );
        return;
      }
      if (line.trim().startsWith('####')) {
        elements.push(
          <h4 key={index} id={`h4-${index}`} className="text-md font-semibold text-slate-200 tracking-tight mt-6 mb-2">
            {line.replace('####', '').trim()}
          </h4>
        );
        return;
      }

      // Checklists
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
        const checked = line.trim().startsWith('- [x]');
        const text = line.replace(checked ? '- [x]' : '- [ ]', '').trim();
        elements.push(
          <div key={index} className="flex items-start gap-3 my-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mt-1 accent-blue-500 rounded border-slate-700 bg-slate-900 h-4 w-4 pointer-events-none"
            />
            <span>{text}</span>
          </div>
        );
        return;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.replace(/^[-*]\s+/, '').trim();
        // Identify bold parts inside items
        elements.push(
          <ul key={index} className="list-disc pl-6 my-1.5 text-sm text-slate-300 tracking-wide leading-relaxed">
            <li>{renderInlineStyles(content)}</li>
          </ul>
        );
        return;
      }

      if (/^\d+\.\s+/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <ol key={index} className="list-decimal pl-6 my-1.5 text-sm text-slate-300 tracking-wide leading-relaxed">
            <li>{renderInlineStyles(content)}</li>
          </ol>
        );
        return;
      }

      // Paragraphs
      if (line.trim() !== '') {
        elements.push(
          <p key={index} className="text-sm text-slate-300 leading-relaxed tracking-wide my-3 font-normal">
            {renderInlineStyles(line)}
          </p>
        );
      }
    });

    if (inTable) {
      const tableEl = flushTable(lines.length);
      if (tableEl) elements.push(tableEl);
    }

    return elements;
  };

  // Replace `**bold**`, ``code``, etc. inline
  const renderInlineStyles = (text: string): React.ReactNode => {
    // Escape or interpret bold markdown
    const parts: React.ReactNode[] = [];
    let currentText = text;

    // Very simple inline bold index parser: **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;

    // Mix parse code blocks and bolds
    let match;
    let index = 0;
    
    // Fallback if regex parsing gets tricky
    // Replace markdown formatting using React JSX array splits
    const formatted: React.ReactNode[] = [];
    const elements = currentText.split(/(\*\*.*?\*\*|`.*?`)/);
    
    elements.forEach((el, i) => {
      if (el.startsWith('**') && el.endsWith('**')) {
        formatted.push(<strong key={i} className="font-semibold text-slate-100">{el.slice(2, -2)}</strong>);
      } else if (el.startsWith('`') && el.endsWith('`')) {
        formatted.push(<code key={i} className="px-1.5 py-0.5 bg-slate-900 text-blue-400 rounded text-xs font-mono">{el.slice(1, -1)}</code>);
      } else {
        formatted.push(el);
      }
    });

    return <>{formatted}</>;
  };

  const getDocIcon = (category: string) => {
    switch (category) {
      case 'architecture': return <Server className="h-4 w-4 text-blue-400" />;
      case 'database': return <Database className="h-4 w-4 text-emerald-400" />;
      case 'api': return <FileText className="h-4 w-4 text-cyan-400" />;
      case 'security': return <Shield className="h-4 w-4 text-rose-400" />;
      default: return <FileText className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <div id="architecture-docs-hub" className="min-h-[80vh] flex flex-col md:flex-row gap-6 bg-slate-950/40 p-1 rounded-2xl border border-slate-800/40">
      {/* Sidebar Selector */}
      <div id="docs-sidebar" className="w-full md:w-80 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-800 p-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Enterprise Architectural Specs</h2>
          <p className="text-xs text-slate-400 mt-1">Review full technical, database, and security specifications.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="docs-search-input"
            type="text"
            placeholder="Search documentation chunks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-300 placeholder-slate-500"
          />
        </div>

        {/* Categories Tab */}
        <div id="docs-categories" className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              id={`tab-cat-${cat}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] rounded-md font-medium capitalize cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document Cards */}
        <div id="docs-list" className="flex flex-col gap-2 overflow-y-auto max-h-[450px] md:max-h-none pr-1">
          {filteredDocs.map((doc) => (
            <button
              id={`btn-doc-select-${doc.id}`}
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                selectedDocId === doc.id
                  ? 'bg-blue-950/50 border-blue-500/40 shadow-md shadow-blue-500/5'
                  : 'bg-slate-900/40 border-slate-850 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getDocIcon(doc.category)}
                <span className="text-slate-100 font-medium text-xs tracking-tight line-clamp-1">{doc.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{doc.summary}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase font-mono">{doc.category}</span>
                <span className="text-[10px] text-blue-400 group-hover:text-blue-300 flex items-center gap-0.5">
                  View Specs
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}

          {filteredDocs.length === 0 && (
            <div className="py-12 text-center border border-dashed border-slate-850 rounded-lg">
              <p className="text-slate-500 text-xs font-medium">No system specs found matching criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Specifications Screen Viewer */}
      <div id="docs-content-viewer" className="flex-1 p-5 min-h-[500px]">
        {selectedDoc ? (
          <div className="animate-fade-in font-sans">
            <div className="flex flex-col gap-2 border-b border-slate-850 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider font-mono rounded border border-slate-800">
                  {selectedDoc.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">• DuesFlow Blueprints & Specs</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight mt-1">{selectedDoc.title}</h1>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{selectedDoc.summary}</p>
            </div>

            {/* Document Rendered Content */}
            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
              {renderMarkdown(selectedDoc.markdown)}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <FileText className="h-10 w-10 text-slate-600 mb-2" />
            <p className="text-slate-400 text-sm font-medium">Please select a specifications documentation on the left side to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
