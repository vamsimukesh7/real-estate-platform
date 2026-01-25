import Layout from '../components/layouts/Layout';
import MessagesWidget from '../components/widgets/MessagesWidget';

const Inbox = () => {
    return (
        <Layout title="Inbox & Messages">
            <div className="h-[calc(100vh-140px)] bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden">
                <MessagesWidget />
            </div>
        </Layout>
    );
};

export default Inbox;
