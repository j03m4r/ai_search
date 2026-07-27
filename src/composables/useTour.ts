import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useTour() {
    function startMainTaskTour(condition: 'traditional' | 'ai', onComplete: (skipped: boolean) => void) {
        const searchTitle = condition === 'traditional' ? 'Search the web' : 'Ask AI Mode';
        const searchDesc = condition === 'traditional'
            ? 'Use this search bar to find information, just like a normal search engine.'
            : 'Ask questions here and get AI-generated answers with cited sources.';

        let completed = false;

        const evidenceStepPopover = `
            <div style="max-width: 280px;">
                <p style="margin-bottom: 10px;">
                When you select a piece of text like this:
                </p>
                <div style="position: relative; padding: 8px 0;">
                    <span style="background-color: #B4D5FE; padding: 4px; text-align: center;">
                        electric cars produce zero tailpipe emissions
                    </span>
                    <div style="width: 100%; display: flex; justify-content: center;">
                        <div class="demo-enter-chip">Press Enter</div>
                    </div>
                </div>
                <p style="margin-top: 12px;">
                A tooltip will appear near your selection. Press Enter to save it as evidence on your canvas.
                </p>
            </div>
            `;

        const tourDriver = driver({
            showProgress: true,
            allowClose: true,
            onDestroyStarted: () => {
                if (!tourDriver.hasNextStep()) completed = true;
                tourDriver.destroy();
            },
            onDestroyed: () => onComplete(!completed),
            steps: [
                { element: '#search-panel', popover: { title: searchTitle, description: searchDesc } },
                {
                    popover: {
                        title: 'You can create evidence from highlighted text',
                        description: evidenceStepPopover,
                    },
                },
                { element: '.vue-flow', popover: { title: 'Your canvas', description: 'This is where you will continue to iterate on your concept map as you search.' } },
                { element: '#conclude-task-btn', popover: { title: 'Finishing up', description: 'Once your representation feels complete, click here. This becomes available 10 minutes into the task.' } },
            ],
        });

        tourDriver.drive();
    }

    return { startMainTaskTour };
}