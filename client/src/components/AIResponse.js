import React from 'react';

function AIResponse({ data }) {
  if (!data) return null;

  if (data.error) {
    return (
      <div style={{
        marginTop: 16,
        padding: 16,
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-sm)',
        color: '#f87171',
        fontSize: 14
      }}>
        {data.error}
      </div>
    );
  }

  // Extract the text content from various response shapes
  const rawContent = data.response || data.analysis || data.email || data.script ||
    data.strategy || data.feedback || data.battlecard || data.advice || '';

  // Handle structured JSON objects (from new AI endpoints)
  const content = typeof rawContent === 'object' ? JSON.stringify(rawContent, null, 2) : rawContent;

  if (!content) return null;

  // Parse markdown-like content into beautiful HTML
  const formatContent = (text) => {
    if (!text) return '';

    // Process the text line by line for rich formatting
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inNumberedList = false;

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('#### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        html += `<h4 style="font-size:13px;font-weight:600;color:#818cf8;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.5px">${trimmed.slice(5)}</h4>`;
      } else if (trimmed.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        html += `<h3 style="font-size:15px;font-weight:600;color:#f4f4f5;margin:18px 0 8px;border-bottom:1px solid #2e2f3e;padding-bottom:6px">${trimmed.slice(4)}</h3>`;
      } else if (trimmed.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        html += `<h2 style="font-size:17px;font-weight:700;color:#f4f4f5;margin:20px 0 10px">${trimmed.slice(3)}</h2>`;
      } else if (trimmed.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        html += `<h1 style="font-size:20px;font-weight:700;color:#f4f4f5;margin:20px 0 10px">${trimmed.slice(2)}</h1>`;
      }
      // Horizontal rule / separator
      else if (trimmed === '---' || trimmed === '***' || trimmed.startsWith('---ASSESSMENT')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        html += `<div style="border-top:2px solid #6366f1;margin:20px 0;opacity:0.4"></div>`;
        if (trimmed.includes('ASSESSMENT')) {
          html += `<div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:12px 16px;margin-bottom:12px"><span style="color:#818cf8;font-weight:600;font-size:14px">Performance Assessment</span></div>`;
        }
      }
      // Bold headers (like **Something:**)
      else if (trimmed.match(/^\*\*[^*]+\*\*:?$/)) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        const text = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
        html += `<div style="font-weight:600;color:#e4e4e7;margin:14px 0 6px;font-size:14px;display:flex;align-items:center;gap:6px"><span style="color:#6366f1">▸</span> ${text}</div>`;
      }
      // Bullet points
      else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        if (!inList) { html += '<ul style="padding-left:0;margin:8px 0;list-style:none">'; inList = true; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        const content = trimmed.slice(2);
        html += `<li style="padding:4px 0 4px 16px;position:relative;font-size:13px;line-height:1.6"><span style="position:absolute;left:0;color:#6366f1">•</span>${formatInline(content)}</li>`;
      }
      // Numbered lists
      else if (trimmed.match(/^\d+[\.\)]\s/)) {
        if (inList) { html += '</ul>'; inList = false; }
        if (!inNumberedList) { html += '<ol style="padding-left:0;margin:8px 0;list-style:none;counter-reset:item">'; inNumberedList = true; }
        const content = trimmed.replace(/^\d+[\.\)]\s/, '');
        const num = trimmed.match(/^(\d+)/)[1];
        html += `<li style="padding:6px 0 6px 32px;position:relative;font-size:13px;line-height:1.6"><span style="position:absolute;left:0;width:22px;height:22px;background:rgba(99,102,241,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#818cf8;top:6px">${num}</span>${formatInline(content)}</li>`;
      }
      // Score lines (e.g., "Rapport Building: 8/10")
      else if (trimmed.match(/:\s*\d+\/10/) || trimmed.match(/:\s*\d+\s*\/\s*10/)) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        const parts = trimmed.split(':');
        const label = parts[0].replace(/\*\*/g, '').trim();
        const scoreMatch = parts.slice(1).join(':').match(/(\d+)\s*\/\s*10/);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1]);
          const pct = score * 10;
          const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';
          html += `<div style="display:flex;align-items:center;gap:12px;padding:6px 0;font-size:13px">
            <span style="min-width:160px;color:#a1a1aa">${label}</span>
            <div style="flex:1;height:8px;background:#1a1b23;border-radius:4px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.5s"></div>
            </div>
            <span style="font-weight:600;color:${color};min-width:40px">${score}/10</span>
          </div>`;
        } else {
          html += `<p style="margin:4px 0;font-size:13px;line-height:1.7">${formatInline(trimmed)}</p>`;
        }
      }
      // Overall score (e.g., "Overall Score: 85/100" or "Overall: 85")
      else if (trimmed.match(/overall.*score.*:\s*\d+/i) || trimmed.match(/score.*:\s*\d+\s*\/\s*100/i)) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        const scoreMatch = trimmed.match(/(\d+)\s*(?:\/\s*100)?/);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1]);
          const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
          html += `<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:rgba(99,102,241,0.08);border-radius:10px;margin:12px 0">
            <div style="width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;box-shadow:0 4px 12px ${color}44">${score}</div>
            <div><div style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Overall Score</div><div style="font-size:16px;font-weight:600;color:#f4f4f5">out of 100</div></div>
          </div>`;
        } else {
          html += `<p style="margin:4px 0;font-size:13px;line-height:1.7">${formatInline(trimmed)}</p>`;
        }
      }
      // Empty line
      else if (trimmed === '') {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
      }
      // Regular paragraph
      else {
        if (inList) { html += '</ul>'; inList = false; }
        if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
        html += `<p style="margin:4px 0;font-size:13px;line-height:1.7;color:#d4d4d8">${formatInline(trimmed)}</p>`;
      }
    });

    if (inList) html += '</ul>';
    if (inNumberedList) html += '</ol>';

    return html;
  };

  const formatInline = (text) => {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong style="color:#f4f4f5;font-style:italic">$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f4f4f5">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:#d4d4d8">$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:#252636;padding:2px 6px;border-radius:4px;font-size:12px;color:#818cf8">$1</code>')
      .replace(/\[([^\]]+)\]/g, '<span style="color:#06b6d4;font-weight:500">[$1]</span>');
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border)'
      }}>
        <span style={{ fontSize: 18 }}>✦</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#818cf8' }}>AI Response</span>
        <span style={{ fontSize: 11, color: '#71717a', marginLeft: 'auto' }}>
          {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : ''}
        </span>
      </div>
      <div
        className="ai-response-content"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}

export default AIResponse;
