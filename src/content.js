// Link Lasso - Content Script
(() => {
    let isRightClickMode = false;
    let hoveredLinks = new Set(); // Use a Set to avoid duplicate URLs
    let linkCounterLabel = null; // Reference to the label element
    let dragStartPos = null; // Track drag start position
    let isDragging = false;
    let lastImageUnderCursor = null; // Track the last image we were hovering over
    let toastTimeout = null;
    let pathCanvas = null; // Canvas for drawing the lasso path
    let lastPoint = null; // Last point in the path

    // Function to create the path canvas
    const createPathCanvas = () => {
        pathCanvas = document.createElement('canvas');
        pathCanvas.style.position = 'fixed';
        pathCanvas.style.top = '0';
        pathCanvas.style.left = '0';
        pathCanvas.style.width = '100%';
        pathCanvas.style.height = '100%';
        pathCanvas.style.pointerEvents = 'none';
        pathCanvas.style.zIndex = '9999';
        pathCanvas.width = window.innerWidth;
        pathCanvas.height = window.innerHeight;
        document.body.appendChild(pathCanvas);
    };

    // Function to remove the path canvas
    const removePathCanvas = () => {
        if (pathCanvas && pathCanvas.parentNode) {
            document.body.removeChild(pathCanvas);
            pathCanvas = null;
        }
        lastPoint = null;
    };

    // Function to draw path segment
    const drawPathSegment = (event) => {
        if (!pathCanvas) return;

        const ctx = pathCanvas.getContext('2d');
        const currentPoint = {
            x: event.clientX,
            y: event.clientY
        };

        if (lastPoint) {
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(currentPoint.x, currentPoint.y);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        lastPoint = currentPoint;
    };

    // Function to show toast notification
    const showToast = (message) => {
        // Remove existing toast if present
        const existingToast = document.getElementById('link-lasso-toast');
        if (existingToast) {
            document.body.removeChild(existingToast);
        }
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        const toast = document.createElement('div');
        toast.id = 'link-lasso-toast';
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            zIndex: '10000',
            fontSize: '14px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'opacity 0.3s ease-in-out'
        });

        document.body.appendChild(toast);
        
        // Fade out and remove after 2 seconds
        toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 2000);
    };

    // Function to create and update the link counter label
    const updateLinkCounterLabel = () => {
        if (!linkCounterLabel) {
            linkCounterLabel = document.createElement('div');
            document.body.appendChild(linkCounterLabel);
            // Style the label
            linkCounterLabel.style.position = 'fixed';
            linkCounterLabel.style.bottom = '20px';
            linkCounterLabel.style.right = '20px';
            linkCounterLabel.style.zIndex = '10000';
            linkCounterLabel.style.padding = '5px';
            linkCounterLabel.style.fontSize = '16px';
            linkCounterLabel.style.color = 'black';
            linkCounterLabel.style.fontWeight = 'bold';
            linkCounterLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            linkCounterLabel.style.borderRadius = '5px';
            linkCounterLabel.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        }
        linkCounterLabel.textContent = `Links: ${hoveredLinks.size}`;
    };

    // Function to remove the link counter label
    const removeLinkCounterLabel = () => {
        if (linkCounterLabel) {
            document.body.removeChild(linkCounterLabel);
            linkCounterLabel = null;
        }
    };

    // Function to download an image
    const downloadImage = (imgElement) => {
        const imgUrl = imgElement.src;
        const fileName = imgUrl.split('/').pop().split('?')[0] || 'image.png';
        
        fetch(imgUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showToast('Image downloaded');
            })
            .catch(error => {
                console.error('Error downloading image:', error);
                showToast('Failed to download image');
            });
    };

    // Function to copy image to clipboard
    const copyImageToClipboard = async (imgElement) => {
        try {
            // Create a temporary img element to handle cross-origin
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            // Create a promise to handle the image loading
            const imageLoadPromise = new Promise((resolve, reject) => {
                tempImg.onload = () => resolve();
                tempImg.onerror = () => reject(new Error('Failed to load image'));
                
                // Try to load with crossOrigin first
                tempImg.src = imgElement.src;
            });

            try {
                await imageLoadPromise;
            } catch (loadError) {
                // If loading fails with crossOrigin, try without it
                // This will still allow copying for same-origin images
                tempImg.crossOrigin = null;
                tempImg.src = imgElement.src;
                await new Promise((resolve, reject) => {
                    tempImg.onload = resolve;
                    tempImg.onerror = reject;
                });
            }

            // Create a canvas and draw the image
            const canvas = document.createElement('canvas');
            canvas.width = tempImg.naturalWidth;
            canvas.height = tempImg.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(tempImg, 0, 0);

            try {
                // Try PNG format first
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
                showToast('Image copied to clipboard');
                return;
            } catch (pngError) {
                console.log('PNG copy failed, trying alternate format...');
                // Try JPEG as fallback
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/jpeg': blob
                    })
                ]);
                showToast('Image copied to clipboard');
            }
        } catch (error) {
            console.error('Failed to copy image:', error);
            showToast('Failed to copy image - try downloading instead');
        }
    };

    // Function to copy image URL to clipboard
    const copyImageUrl = (imgElement) => {
        navigator.clipboard.writeText(imgElement.src)
            .then(() => {
                showToast('Image URL copied to clipboard');
            })
            .catch(error => {
                console.error('Failed to copy URL:', error);
                showToast('Failed to copy URL');
            });
    };

    // Function to determine drag direction
    const getDragDirection = (event) => {
        if (!dragStartPos) return null;
        
        const dx = event.clientX - dragStartPos.x;
        const dy = event.clientY - dragStartPos.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        // Require a minimum drag distance and clear dominant direction
        if (Math.max(absDx, absDy) < 30) return null;
        
        // Require one direction to be at least 1.5x stronger than the other
        if (absDx > absDy * 1.5) {
            return dx < 0 ? 'left' : 'right';
        } else if (absDy > absDx * 1.5) {
            return dy < 0 ? 'up' : 'down';
        }
        
        return 'diagonal';
    };

    // Function to get computed background color
    const getBackgroundColor = (element) => {
        let bg = window.getComputedStyle(element).backgroundColor;
        let parent = element.parentElement;
        
        // If background is transparent, check parent elements
        while (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
            if (!parent) break;
            bg = window.getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
        }
        
        // If we still don't have a color, assume white
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
            bg = 'rgb(255, 255, 255)';
        }
        
        return bg;
    };

    // Function to calculate relative luminance
    const getLuminance = (r, g, b) => {
        let [rs, gs, bs] = [r/255, g/255, b/255].map(c => {
            return c <= 0.03928 ? c/12.92 : Math.pow((c + 0.055)/1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    // Function to parse RGB/RGBA color string
    const parseColor = (color) => {
        const match = color.match(/\d+/g);
        return match ? match.map(Number) : [255, 255, 255];
    };

    // Function to add a link to the set of hovered links and update the counter
    const addLinkToHoveredList = (event) => {
        if (!isRightClickMode) return;
        const link = event.currentTarget;
        const url = link.href;
        if (url) {
            // Toggle the link in/out of the set
            if (hoveredLinks.has(url)) {
                hoveredLinks.delete(url);
                // Restore original styles
                if (link._originalStyles) {
                    Object.assign(link.style, link._originalStyles);
                    delete link._originalStyles;
                }
            } else {
                hoveredLinks.add(url);
                // Store original styles
                if (!link._originalStyles) {
                    link._originalStyles = {
                        color: link.style.color,
                        fontWeight: link.style.fontWeight,
                        backgroundColor: link.style.backgroundColor,
                        transition: link.style.transition
                    };
                }
                
                // Apply highlight styles
                link.style.color = '#ff4500';
                link.style.fontWeight = 'bold';
                link.style.backgroundColor = 'transparent';
                link.style.transition = 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out';
            }
            updateLinkCounterLabel();
        }
    };

    // Function to enable link-opening mode
    const enableLinkOpeningMode = (event) => {
        isRightClickMode = true;
        dragStartPos = { x: event.clientX, y: event.clientY };
        isDragging = false;
        lastPoint = { x: event.clientX, y: event.clientY };
        
        // Only create path canvas if not starting on an image
        const elementsUnderCursor = document.elementsFromPoint(event.clientX, event.clientY);
        const startedOnImage = elementsUnderCursor.some(el => el.tagName === 'IMG');
        
        if (!startedOnImage) {
            createPathCanvas();
        }

        // Clear any text selection
        window.getSelection().removeAllRanges();
        // Add mouseover listeners to all links
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('mouseover', addLinkToHoveredList);
            // Store original background color
            link._originalBg = link.style.backgroundColor;
        });
    };

    // Function to handle mouse movement
    const handleMouseMove = (event) => {
        if (!isRightClickMode || !dragStartPos) return;

        const dx = event.clientX - dragStartPos.x;
        const dy = event.clientY - dragStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If we've moved more than 10 pixels and we're over an image, switch to image mode
        if (distance > 10) {
            const elementsUnderCursor = document.elementsFromPoint(event.clientX, event.clientY);
            const imageUnderCursor = elementsUnderCursor.find(el => el.tagName === 'IMG');
            
            if (imageUnderCursor) {
                isDragging = true;
                lastImageUnderCursor = imageUnderCursor;
                removePathCanvas(); // Remove path canvas when dragging images
                const direction = getDragDirection(event);
                switch (direction) {
                    case 'left':
                        imageUnderCursor.style.cursor = 'copy';
                        break;
                    case 'up':
                        imageUnderCursor.style.cursor = 'grab';
                        break;
                    default:
                        imageUnderCursor.style.cursor = 'download';
                }
            } else if (pathCanvas) {
                // If we're not over an image and have a canvas, keep drawing
                drawPathSegment(event);
            }
        } else if (pathCanvas) {
            // Always draw if we have a canvas, even for small movements
            drawPathSegment(event);
        }
    };

    // Function to open links and clear the list
    const openLinksAndClearList = (event) => {
        const linkCount = hoveredLinks.size;  // Store size before clearing
        
        if (isDragging && lastImageUnderCursor) {
            const direction = getDragDirection(event);
            
            switch (direction) {
                case 'left':
                    copyImageUrl(lastImageUnderCursor);
                    break;
                case 'up':
                    copyImageToClipboard(lastImageUnderCursor)
                        .then(() => showToast('Image copied to clipboard'))
                        .catch(error => {
                            console.error('Failed to copy image:', error);
                            showToast('Failed to copy image - try downloading instead');
                        });
                    break;
                default: // down, right, or diagonal
                    downloadImage(lastImageUnderCursor);
            }
            lastImageUnderCursor = null;
        } else if (linkCount > 0) {  // Use stored count
            if (event.shiftKey) {
                // If shift is held, copy links to clipboard instead of opening
                const linksText = Array.from(hoveredLinks).join('\n');
                navigator.clipboard.writeText(linksText)
                    .then(() => showToast(`${linkCount} link${linkCount === 1 ? '' : 's'} copied to clipboard`))
                    .catch(error => {
                        console.error('Failed to copy links:', error);
                        showToast('Failed to copy links');
                    });
            } else {
                // Open all links in background tabs
                const urls = Array.from(hoveredLinks);
                urls.forEach((url, index) => {
                    chrome.runtime.sendMessage({
                        action: 'openTab',
                        url,
                        active: false  // Keep all tabs inactive to maintain focus on current tab
                    });
                });
                showToast(`Opened ${linkCount} link${linkCount === 1 ? '' : 's'} in background tabs`);
            }
        }
        hoveredLinks.clear();
        removeLinkCounterLabel();
    };

    // Function to disable link-opening mode and open links
    const disableLinkOpeningModeAndOpenLinks = (event) => {
        if (!isRightClickMode) return;
        isRightClickMode = false;
        
        // Remove path canvas
        removePathCanvas();
        
        // Remove mouseover listeners and restore original styles
        document.querySelectorAll('a[href]').forEach(link => {
            link.removeEventListener('mouseover', addLinkToHoveredList);
            if (link._originalStyles) {
                Object.assign(link.style, link._originalStyles);
                delete link._originalStyles;
            }
        });
        
        openLinksAndClearList(event);
        dragStartPos = null;
        isDragging = false;
    };

    // Suppress context menu on right mouse button release
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Listen for right mouse button down to enable the mode
    document.addEventListener('mousedown', (event) => {
        if (event.button === 2) { // Right mouse button
            enableLinkOpeningMode(event);
        }
    });

    // Listen for mouse movement to detect dragging
    document.addEventListener('mousemove', handleMouseMove);

    // Listen for mouseup event to disable the mode and open links
    document.addEventListener('mouseup', (event) => {
        if (event.button === 2) { // Right mouse button
            disableLinkOpeningModeAndOpenLinks(event);
        }
    });

    console.log('Link Lasso initialized: Right-click and hold to gather links. For images: drag left to copy URL, up to copy image, other directions to download.');
})(); 