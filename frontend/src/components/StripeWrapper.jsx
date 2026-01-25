import Link from 'react-router-dom';

const StripeWrapper = ({ children }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Stripe Payment Integration</h3>
            <p className="text-gray-600 mb-4 text-center">To process real payments, you need to configure Stripe keys in your environment variables.</p>
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mb-4">
                <strong>Note:</strong> Since this is a demo environment, payments are simulated.
                Using the "Deposit" button in your wallet will instantly add funds without charging a real card.
            </div>
            {children}
        </div>
    );
};

export default StripeWrapper;
