import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const Graph = ({ data }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !data.graph_edges || !data.suspicious_accounts) return;

    // Extract all unique nodes from edges
    const nodes = new Set();
    data.graph_edges.forEach(edge => {
      nodes.add(edge.source);
      nodes.add(edge.target);
    });

    // Create a map of suspicious accounts for quick lookup
    const suspiciousMap = {};
    data.suspicious_accounts.forEach(account => {
      suspiciousMap[account.account_id] = account;
    });

    // Prepare nodes for cytoscape
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

    // Prepare edges for cytoscape
    const cyEdges = data.graph_edges.map((edge, idx) => ({
      data: {
        id: `e${idx}`,
        source: edge.source,
        target: edge.target,
        weight: edge.weight
      }
    }));

    // Initialize Cytoscape
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
            'font-size': '10px',
            'width': '30px',
            'height': '30px'
          }
        },
        {
          selector: 'node[suspicious]',
          style: {
            'background-color': '#ef4444',
            'border-width': '3px',
            'border-color': '#dc2626',
            'width': '35px',
            'height': '35px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1
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

    // Add hover effects and tooltips
    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      const accountData = node.data('accountData');
      
      if (accountData) {
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'cy-tooltip';
        tooltip.className = 'absolute bg-gray-900 text-white p-3 rounded shadow-lg text-sm z-50';
        tooltip.style.pointerEvents = 'none';
        
        tooltip.innerHTML = `
          <div class="font-bold mb-1">Account: ${accountData.account_id}</div>
          <div>Risk Score: ${accountData.risk_score.toFixed(2)}</div>
          <div>Patterns: ${accountData.detected_patterns.join(', ')}</div>
          <div>Incoming: $${accountData.flow_metrics.total_incoming.toFixed(2)}</div>
          <div>Outgoing: $${accountData.flow_metrics.total_outgoing.toFixed(2)}</div>
          <div>Net Flow: $${accountData.flow_metrics.net_flow.toFixed(2)}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        const updateTooltipPosition = (e) => {
          tooltip.style.left = `${e.clientX + 10}px`;
          tooltip.style.top = `${e.clientY + 10}px`;
        };
        
        updateTooltipPosition(event.originalEvent);
        
        const mouseMoveHandler = (e) => updateTooltipPosition(e);
        document.addEventListener('mousemove', mouseMoveHandler);
        
        node.data('tooltipCleanup', () => {
          document.removeEventListener('mousemove', mouseMoveHandler);
          tooltip.remove();
        });
      }
      
      // Highlight node
      node.style({
        'border-width': '4px',
        'border-color': '#fbbf24'
      });
    });

    cy.on('mouseout', 'node', (event) => {
      const node = event.target;
      const cleanup = node.data('tooltipCleanup');
      if (cleanup) {
        cleanup();
        node.removeData('tooltipCleanup');
      }
      
      // Reset highlight
      const isSuspicious = node.data('suspicious');
      node.style({
        'border-width': isSuspicious ? '3px' : '0px',
        'border-color': isSuspicious ? '#dc2626' : '#3b82f6'
      });
    });

    // Detect and highlight cycles with a yellow glow effect
    const cycles = detectCycles(cy);
    const cycleNodes = new Set();
    cycles.forEach(cycle => {
      cycle.forEach(nodeId => cycleNodes.add(nodeId));
    });
    
    cycleNodes.forEach(nodeId => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0 && !node.data('suspicious')) {
        // Only apply yellow border if not suspicious (suspicious nodes stay red)
        node.style({
          'border-width': '4px',
          'border-color': '#fbbf24',
          'border-style': 'double'
        });
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data]);

  // Simple cycle detection for visualization
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
        
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart !== -1) {
            cycles.push(path.slice(cycleStart));
          }
        }
      }

      recursionStack.delete(nodeId);
    };

    cy.nodes().forEach(node => {
      if (!visited.has(node.id())) {
        dfs(node.id(), []);
      }
    });

    return cycles;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Graph Visualization</h2>
      {data && data.graph_edges && data.graph_edges.length > 0 ? (
        <div
          ref={containerRef}
          className="border border-gray-300 rounded"
          style={{ width: '100%', height: '500px' }}
        />
      ) : (
        <div className="border border-gray-300 rounded p-8 text-center text-gray-500" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Upload a CSV file to visualize the transaction graph
        </div>
      )}
    </div>
  );
};

export default Graph;
