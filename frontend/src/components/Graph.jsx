import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const Graph = ({ data }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !data.graph_edges || !data.suspicious_accounts) return;

    const nodes = new Set();
    data.graph_edges.forEach(edge => {
      nodes.add(edge.source);
      nodes.add(edge.target);
    });

    const suspiciousMap = {};
    data.suspicious_accounts.forEach(account => {
      suspiciousMap[account.account_id] = account;
    });

    const cyNodes = Array.from(nodes).map(nodeId => {
      const isSuspicious = suspiciousMap[nodeId];
      return {
        data: {
          id: nodeId,
          label: nodeId,
          suspicious: !!isSuspicious,
          accountData: isSuspicious || null
        }
      };
    });

    const cyEdges = data.graph_edges.map((edge, idx) => ({
      data: {
        id: `e${idx}`,
        source: edge.source,
        target: edge.target,
        weight: edge.weight
      }
    }));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '9px',
            'width': '28px',
            'height': '28px',
            'border-width': '0px'
          }
        },
        {
          // Cytoscape boolean attribute selector: matches nodes where 'suspicious' is truthy
          selector: 'node[?suspicious]',
          style: {
            'background-color': '#ef4444',
            'border-width': '3px',
            'border-color': '#dc2626',
            'width': '34px',
            'height': '34px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 5
      },
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false
    });

    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      const accountData = node.data('accountData');

      if (accountData) {
        const tooltip = document.createElement('div');
        tooltip.id = 'cy-tooltip';
        tooltip.style.cssText = 'position:fixed;background:#0f172a;color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-size:12px;z-index:9999;pointer-events:none;max-width:220px;';

        tooltip.innerHTML = `
          <div style="font-weight:700;margin-bottom:6px;color:#7dd3fc">${accountData.account_id}</div>
          <div>Score: <b>${accountData.suspicion_score}</b>/100</div>
          <div>Patterns: ${accountData.detected_patterns.join(', ')}</div>
          ${accountData.ring_id ? `<div>Ring: <b>${accountData.ring_id}</b></div>` : ''}
        `;

        document.body.appendChild(tooltip);

        const updatePos = (e) => {
          tooltip.style.left = `${e.clientX + 14}px`;
          tooltip.style.top = `${e.clientY + 14}px`;
        };
        updatePos(event.originalEvent);
        const handler = (e) => updatePos(e);
        document.addEventListener('mousemove', handler);
        node.data('tooltipCleanup', () => {
          document.removeEventListener('mousemove', handler);
          tooltip.remove();
        });
      }

      node.style({ 'border-width': '4px', 'border-color': '#fbbf24' });
    });

    cy.on('mouseout', 'node', (event) => {
      const node = event.target;
      const cleanup = node.data('tooltipCleanup');
      if (cleanup) { cleanup(); node.removeData('tooltipCleanup'); }
      const isSuspicious = node.data('suspicious');
      node.style({
        'border-width': isSuspicious ? '3px' : '0px',
        'border-color': isSuspicious ? '#dc2626' : '#3b82f6'
      });
    });

    // Highlight cycle nodes
    const cycles = detectCycles(cy);
    const cycleNodes = new Set();
    cycles.forEach(cycle => cycle.forEach(nodeId => cycleNodes.add(nodeId)));
    cycleNodes.forEach(nodeId => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0 && !node.data('suspicious')) {
        node.style({ 'border-width': '3px', 'border-color': '#f59e0b', 'border-style': 'solid' });
      }
    });

    cyRef.current = cy;
    return () => { if (cyRef.current) cyRef.current.destroy(); };
  }, [data]);

  const detectCycles = (cy) => {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const dfs = (nodeId, path) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      const node = cy.getElementById(nodeId);
      const outgoers = node.outgoers('node');
      for (let i = 0; i < outgoers.length; i++) {
        const neighbor = outgoers[i].id();
        if (!visited.has(neighbor)) dfs(neighbor, [...path]);
        else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart !== -1) cycles.push(path.slice(cycleStart));
        }
      }
      recursionStack.delete(nodeId);
    };
    cy.nodes().forEach(node => { if (!visited.has(node.id())) dfs(node.id(), []); });
    return cycles;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Fraud Network Graph</h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block border-2 border-red-700" />
            Suspicious
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block border-2 border-yellow-500" />
            In Cycle
          </span>
        </div>
      </div>
      {data && data.graph_edges && data.graph_edges.length > 0 ? (
        <div
          ref={containerRef}
          className="border border-gray-100 rounded-xl bg-slate-50"
          style={{ width: '100%', height: '460px' }}
        />
      ) : (
        <div
          className="border border-gray-100 rounded-xl bg-slate-50 flex items-center justify-center text-gray-400 text-sm"
          style={{ height: '460px' }}
        >
          Upload a CSV file to visualise the transaction network
        </div>
      )}
    </div>
  );
};

export default Graph;
