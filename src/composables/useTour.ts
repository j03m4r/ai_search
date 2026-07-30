import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useTour() {
    function startMainTaskTour(condition: 'traditional' | 'ai', onComplete: (skipped: boolean) => void) {
        const searchTitle = condition === 'traditional' ? 'Search the web' : 'Ask AI Mode';
        const searchDesc = condition === 'traditional'
            ? 'Use this search bar to find information, just like a normal search engine.'
            : 'Ask questions here and get AI-generated answers with cited sources.';

        let completed = false;

        const tourDriver = driver({
            showProgress: true,
            allowClose: false,
            onDestroyStarted: () => {
                if (!tourDriver.hasNextStep()) completed = true;
                tourDriver.destroy();
            },
            onDestroyed: () => onComplete(!completed),
            steps: [
                { element: '#search-panel', popover: { title: searchTitle, description: searchDesc } },
                { element: '.vue-flow', popover: { title: 'Your canvas', description: 'This is where you will continue to iterate on your concept map as you search.' } },
                { element: '#conclude-task-btn', popover: { title: 'Finishing up', description: 'Once your representation feels complete, click here. This becomes available after sufficient time has passed.' } },
            ],
        });

        tourDriver.drive();
    }

    function startHighlightTour(onComplete: () => void) {
        const tourDriver = driver({
            showProgress: true,
            allowClose: false,
            onDestroyed: () => onComplete(),
            steps: [
                { element: '#tour-highlight', popover: { title: 'Creating evidence from text', description: 'You can highlight text in search results and press Enter to create evidence from it' } },
            ],
        });

        tourDriver.drive();
    }

    function startRepresentationTour(
        onSpawn: () => void,
        onDespawn: () => void,
        onComplete: () => void
    ) {
        onSpawn();
        const tourDriver = driver({
            onDestroyed: () => { onDespawn(); onComplete(); },
            allowClose: false,
            steps: [
                { element: '.vue-flow', popover: { title: 'Your canvas', description: 'This is where you develop and organize your concept map.' } },
                {
                    element: '#tour-add-cat',
                    popover: { title: 'Adding a category', description: 'This button adds a fresh category to the canvas.' },
                },
                {
                    element: '#tour-add-ev',
                    popover: { title: 'Adding evidence', description: 'This button adds a fresh piece of evidence to the canvas.' },
                },
                {
                    element: '#ex-cat',
                    popover: { title: 'Using categories', description: 'Here&apos;s an example category. Let&apos;s walk through the different ways you can interact with categories and evidence.' },
                },
                {
                    element: '#tour-rename-cat',
                    popover: { title: 'Renaming categories', description: 'You can edit the text of categories here' },
                },
                {
                    element: '#tour-delete-cat',
                    popover: { title: 'Deleting a category', description: 'This button removes a category from the canvas (recoverable from trash) — any evidence inside moves back onto the canvas rather than being deleted with it.' },
                },
                {
                    element: '#tour-importance-cat',
                    popover: { title: 'Updating category importance', description: 'Using this slider you can adjust the importance you believe a category holds.' },
                },
                {
                    element: '#tour-evidence-pool',
                    popover: { title: 'Adding evidence to categories', description: 'This is where you will drag and drop evidence into categories.' },
                },
                {
                    element: '#tour-rename-ev',
                    popover: { title: 'Changing evidence text', description: 'Just like categories, you can edit the text here' },
                },
                {
                    element: '#tour-eject-evidence',
                    popover: { title: 'Removing evidence from a category', description: 'This button takes a piece of evidence out of a category without deleting it, so you can move it elsewhere.' },
                },
                {
                    element: '#tour-delete-evidence',
                    popover: { title: 'Deleting evidence', description: 'This button removes a piece of evidence from the canvas (recoverable from the trash).' },
                },
            ],
        });
        tourDriver.drive();
    }

    return { startMainTaskTour, startHighlightTour, startRepresentationTour };
}