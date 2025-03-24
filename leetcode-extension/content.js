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
            excalidrawButton.innerHTML = 'Excalidraw';

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

            // Function to get problem content
            function getProblemContent() {
                // Get problem ID from URL
                const problemId = window.location.pathname.split('/')[2];
                
                // Check if we have cached content
                const cachedContent = localStorage.getItem(`leetcode_${problemId}`);
                if (cachedContent) {
                    return cachedContent;
                }

                // Get the content as before
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

                // Cache the content
                localStorage.setItem(`leetcode_${problemId}`, content);
                return content;
            }

            function createExcalidrawElement(text, x, y) {
                return {
                    id: `leetcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: "text",
                    x: x,
                    y: y,
                    width: 500, // approximate width
                    height: 35,
                    angle: 0,
                    strokeColor: "#1e1e1e",
                    backgroundColor: "transparent",
                    fillStyle: "solid",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 2,
                    opacity: 100,
                    groupIds: [],
                    frameId: null,
                    roundness: null,
                    seed: Math.floor(Math.random() * 1000000),
                    version: 1,
                    versionNonce: Math.floor(Math.random() * 1000000),
                    isDeleted: false,
                    boundElements: null,
                    updated: Date.now(),
                    link: null,
                    locked: false,
                    text: text,
                    fontSize: 28,
                    fontFamily: 5,
                    textAlign: "left",
                    verticalAlign: "top",
                    containerId: null,
                    originalText: text,
                    autoResize: true,
                    lineHeight: 1.25
                };
            }

            excalidrawButton.addEventListener('click', () => {
                const content = getProblemContent();
                
                // Split content into lines
                const lines = content.split('\n').filter(line => line.trim());
                
                // Create Excalidraw elements array
                const elements = lines.map((line, index) => 
                    createExcalidrawElement(line, -2000, 3500 + (index * 50))
                );

                // Save to Excalidraw localStorage
                const excalidrawData = {
                    type: "excalidraw",
                    version: 2,
                    source: "leetcode-extension",
                    elements: elements,
                    appState: {
                        viewBackgroundColor: "#ffffff",
                        currentItemFontFamily: 5
                    }
                };

                localStorage.setItem('excalidraw', JSON.stringify(excalidrawData));
                
                // Open Excalidraw in a new tab
                window.open('https://excalidraw.com/', '_blank');
            });

            // Add hover events
            buttonWrapper.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });

            buttonWrapper.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });

            // Append elements
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
