// Demo file for Balanced Thought Generator
// This shows how to use the component standalone or in a modal

import BalancedThoughtGenerator from "@/components/ui/balanced-thought-generator";

// Example 1: Standalone usage (full page)
const StandaloneDemo = () => {
    return <BalancedThoughtGenerator standalone={true} />;
};

// Example 2: Modal usage with close handler
const ModalDemo = () => {
    const handleClose = () => {
        console.log('Closing balanced thought generator');
        // Navigate away or close modal
    };

    return <BalancedThoughtGenerator onClose={handleClose} standalone={false} />;
};

export { StandaloneDemo, ModalDemo };
