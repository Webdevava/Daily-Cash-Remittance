import { Footer } from "../Footer";
import { MainHeader } from "../MainHeader";

export default function MainLayout({ children }) {
    return (
     <div className="flex flex-col min-h-screen">
        <MainHeader />
        <div className="flex-grow flex items-center justify-center">
            {children}
        </div>
        <Footer />
     </div>
    );
  }