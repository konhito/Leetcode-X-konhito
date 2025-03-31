function loadChartJS() {
    return new Promise((resolve, reject) => {
        if (window.Chart) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function createExcalidrawButton() {
    const buttonContainerInterval = setInterval(() => {
        const buttonContainer = document.querySelector('div[class*="action-btn-container"]') || 
                              document.querySelector('div[class*="ml-auto"]') ||
                              document.evaluate('/html/body/div[1]/div[2]/div/div/div[4]/div/div/div[4]/div/div[1]/div[2]', 
                                document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (buttonContainer && !document.querySelector('#excalidraw-btn')) {
            clearInterval(buttonContainerInterval);

            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.position = 'relative';
            buttonWrapper.style.display = 'inline-block';

            const excalidrawButton = document.createElement('button');
            excalidrawButton.className = 'rounded-full px-3 py-1.5 items-center whitespace-nowrap transition-all focus:outline-none inline-flex bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-text-2 dark:text-dark-text-2 ml-2';
            excalidrawButton.id = 'excalidraw-btn';
            excalidrawButton.innerHTML = 'Check Complexity';

            const tooltip = document.createElement('span');
            tooltip.innerHTML = 'by Konhito';
            tooltip.style.cssText = `
                visibility: hidden;
                position: absolute;
                background-color: #333;
                color: white;
                text-align: center;
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 12px;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                margin-bottom: 5px;
                opacity: 0;
                transition: opacity 0.3s;
            `;

      
            function getProblemContent() {
           
                const problemId = window.location.pathname.split('/')[2];
                
         
                const cachedContent = localStorage.getItem(`leetcode_${problemId}`);
                if (cachedContent) {
                    return cachedContent;
                }

          
                const titleElement = document.querySelector('div[data-track-load="description_content"] h4');
                const title = titleElement ? titleElement.textContent.trim() : '';

                const descriptionElement = document.querySelector('div[data-track-load="description_content"] div._1l1MA');
                const description = descriptionElement ? descriptionElement.innerText.trim() : '';

                const exampleElements = document.querySelectorAll('div[data-track-load="description_content"] pre');
                const examples = Array.from(exampleElements)
                    .map(ex => ex.textContent.trim())
                    .filter(Boolean)
                    .join('\n\n');

                const constraintsElement = document.querySelector('div[data-track-load="description_content"] div._1l1MA > p:last-of-type');
                const constraints = constraintsElement ? constraintsElement.textContent.trim() : '';

                const content = `# ${title}

## Problem Description
${description}

## Examples
${examples}

## Constraints
${constraints}`;

            
                localStorage.setItem(`leetcode_${problemId}`, content);
                return content;
            }

            

            function getCodeContent() {
                
                const codeEditor = document.querySelector('.monaco-editor');
                if (!codeEditor) return null;

               
                const codeContent = codeEditor.querySelector('.view-lines').textContent;
                return codeContent.trim();
            }

            async function analyzeComplexity(code) {
                const API_KEY = "AIzaSyBr_41k6M7BThI3aeOruBE2kCCBjh24doU"; 
                const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key="
                
                const prompt = `Analyze this code and provide its time and space complexity. Only return the complexities, no explanation:
                ${code}`;

                console.log(code)

                try {
                    const response = await fetch(API_URL+API_KEY, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: prompt
                                }]
                            }]
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error analyzing code:', errorData);
                        return `Error analyzing complexity: ${errorData.error.message}`;
                    }

                    const data = await response.json();
                    return data.candidates[0].content.parts[0].text;
                } catch (error) {
                    console.error('Error analyzing code:', error);
                    return 'Error analyzing complexity';
                }
            }

            async function createPopupGraph(complexity) {
                // Load Chart.js first
                await loadChartJS();
            
                // Remove existing popup if any
                const existingPopup = document.getElementById('complexity-popup');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }
            
                const popup = document.createElement('div');
                popup.id = 'complexity-popup';
                popup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    z-index: 1000;
                    width: 400px;
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                `;
            
              
                const canvasContainer = document.createElement('div');
                canvasContainer.style.flex = '1';
                const canvas = document.createElement('canvas');
                canvas.id = 'complexity-chart';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvasContainer.appendChild(canvas);
                popup.appendChild(canvasContainer);
            
            
                const complexityText = document.createElement('div');
                complexityText.style.cssText = `
                    padding: 10px;
                    margin-top: 10px;
                    border-top: 1px solid #eee;
                    text-align: center;
                    font-family: monospace;
                    font-size: 14px;
                    color: #333;
                `;
                complexityText.textContent = complexity;
                popup.appendChild(complexityText);
            
                document.body.appendChild(popup);
            
           
                const complexityValues = {
                    'O(1)': 1,
                    'O(log n)': 2,
                    'O(n)': 3,
                    'O(n log n)': 4,
                    'O(n^2)': 5,
                    'O(2^n)': 6
                };
        
                const timeComplexity = complexity.split('\n')
                    .find(line => line.toLowerCase().includes('time'))
                    ?.replace(/time:?\s*/i, '')
                    ?.trim() || 'O(1)';
            
         
                const dataPoints = [];
                const n = 20; // Increase number of points for smoother curve
                
                for (let i = 1; i <= n; i++) {
                    let y;
                    const x = i;
                    
                    switch(timeComplexity.toLowerCase()) {
                        case 'o(1)':
                            y = 1;
                            break;
                        case 'o(log n)':
                            y = Math.log2(x);
                            break;
                        case 'o(n)':
                            y = x;
                            break;
                        case 'o(n log n)':
                            y = x * Math.log2(x);
                            break;
                        case 'o(n^2)':
                            y = x * x;
                            break;
                        case 'o(2^n)':
                            y = Math.pow(2, x);
                            break;
                        default:
                            y = x; // Default to linear if unknown
                    }
                    
                    // Normalize very large values
                    if (y > 1000) {
                        y = 1000 * Math.log2(y / 1000 + 1);
                    }
                    
                    dataPoints.push({x, y});
                }
            
              
                const chart = new Chart(canvas, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: `Time Complexity: ${timeComplexity}`,
                            data: dataPoints,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1000,
                            easing: 'easeInOutQuart'
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Input Size (n)',
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    }
                                },
                                min: 0
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Operations',
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    }
                                },
                                min: 0,
                                ticks: {
                                    callback: function(value) {
                                        if (value >= 1000) {
                                            return (value/1000).toFixed(1) + 'k';
                                        }
                                        return value;
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                enabled: true,
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += context.parsed.y.toFixed(2) + ' operations';
                                        }
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
            
               
                const closeButton = document.createElement('button');
                closeButton.innerHTML = '×';
                closeButton.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                `;
                closeButton.onmouseover = () => closeButton.style.opacity = '1';
                closeButton.onmouseleave = () => closeButton.style.opacity = '0.7';
                closeButton.onclick = () => document.body.removeChild(popup);
                popup.appendChild(closeButton);

                // Add this to handle dark mode
                const isDarkMode = document.documentElement.classList.contains('dark');
                if (isDarkMode) {
                    popup.style.backgroundColor = '#1f2937';
                    popup.style.color = '#fff';
                    complexityText.style.color = '#fff';
                    complexityText.style.borderTopColor = '#374151';
                }
            }

            excalidrawButton.addEventListener('click', async () => {
                const code = getCodeContent();
                if (!code) {
                    alert('No code found in editor');
                    return;
                }

                excalidrawButton.disabled = true;
                excalidrawButton.innerHTML = 'Analyzing...';
                
                try {
                    const complexity = await analyzeComplexity(code);
                    createPopupGraph(complexity);
                } catch (error) {
                    console.error('Error creating graph:', error);
                    alert('Failed to create complexity graph');
                } finally {
                    excalidrawButton.disabled = false;
                    excalidrawButton.innerHTML = 'Check Complexity';
                }
            });

           
            buttonWrapper.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });

            buttonWrapper.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });

         
            buttonWrapper.appendChild(tooltip);
            buttonWrapper.appendChild(excalidrawButton);
            buttonContainer.appendChild(buttonWrapper);
            console.log('Excalidraw button added successfully');
        }
    }, 1000);

    setTimeout(() => clearInterval(buttonContainerInterval), 10000);
}


createExcalidrawButton();


let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        createExcalidrawButton();
    }
}).observe(document, {subtree: true, childList: true});


window.addEventListener('load', createExcalidrawButton);
