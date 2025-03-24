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
                const API_KEY = "Your api here"; // Replace with your API key
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

            function createPopupGraph(complexity) {
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
        
                const timeComplexity = complexity.split('\n')[0].replace('Time: ', '').trim();
                const complexityLevel = complexityValues[timeComplexity] || 0;
            
         
                const dataPoints = [];
                for (let i = 0; i <= 10; i++) {
                    let y;
                    switch(timeComplexity) {
                        case 'O(1)': y = 1; break;
                        case 'O(log n)': y = Math.log2(i + 1); break;
                        case 'O(n)': y = i; break;
                        case 'O(n log n)': y = i * Math.log2(i + 1); break;
                        case 'O(n^2)': y = i * i; break;
                        case 'O(2^n)': y = Math.pow(2, i); break;
                        default: y = 0;
                    }
                    dataPoints.push({x: i, y: y});
                }
            
              
                new Chart(canvas, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Time Complexity',
                            data: dataPoints,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: 'linear',
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Input Size (n)',
                                    color: '#666'
                                },
                                grid: {
                                    color: '#eee'
                                },
                                ticks: {
                                    display: false // Hide x-axis numbers
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Time',
                                    color: '#666'
                                },
                                grid: {
                                    color: '#eee'
                                },
                                ticks: {
                                    display: false 
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
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
            }

            excalidrawButton.addEventListener('click', async () => {
                const code = getCodeContent();
                if (!code) {
                    alert('No code found in editor');
                    return;
                }

                const complexity = await analyzeComplexity(code);
                createPopupGraph(complexity);
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
