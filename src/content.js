// Link Opener - Content Script
(() => {
    let isRightClickMode = false;
    let hoveredLinks = new Set(); // Use a Set to avoid duplicate URLs
    let linkCounterLabel = null; // Reference to the label element

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

    // Function to add a link to the set of hovered links and update the counter
    const addLinkToHoveredList = (event) => {
        if (!isRightClickMode) return;
        const url = event.currentTarget.href;
        if (url) {
            hoveredLinks.add(url);
            updateLinkCounterLabel();
        }
    };

    // Function to enable link-opening mode
    const enableLinkOpeningMode = () => {
        isRightClickMode = true;
        // Clear any text selection
        window.getSelection().removeAllRanges();
        // Add mouseover listeners to all links
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('mouseover', addLinkToHoveredList);
        });
    };

    // Function to open links and clear the list
    const openLinksAndClearList = () => {
        if (hoveredLinks.size > 0) {
            if (event.shiftKey) {
                // If shift is held, copy links to clipboard instead of opening
                const linksText = Array.from(hoveredLinks).join('\n');
                navigator.clipboard.writeText(linksText)
                    .then(() => console.log('Links copied to clipboard'))
                    .catch(error => console.error('Failed to copy links:', error));
            } else {
                // Open each link in a new tab
                hoveredLinks.forEach(url => window.open(url, '_blank'));
            }
            hoveredLinks.clear();
        }
        removeLinkCounterLabel();
    };

    // Function to disable link-opening mode and open links
    const disableLinkOpeningModeAndOpenLinks = () => {
        if (!isRightClickMode) return;
        isRightClickMode = false;
        // Remove mouseover listeners from all links
        document.querySelectorAll('a[href]').forEach(link => {
            link.removeEventListener('mouseover', addLinkToHoveredList);
        });
        openLinksAndClearList();
    };

    // Suppress context menu on right mouse button release
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Listen for right mouse button down to enable the mode
    document.addEventListener('mousedown', (event) => {
        if (event.button === 2) { // Right mouse button
            enableLinkOpeningMode();
        }
    });

    // Listen for mouseup event to disable the mode and open links
    document.addEventListener('mouseup', (event) => {
        if (event.button === 2) { // Right mouse button
            disableLinkOpeningModeAndOpenLinks();
        }
    });

    console.log('Link Opener initialized: Right-click and hold, then hover over links to open them in new tabs.');
})(); 