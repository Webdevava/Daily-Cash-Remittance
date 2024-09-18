import { Footer } from "../Footer";
import { Header } from "../Header";

export default function AuthLayout({ children }) {
    return (
     <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
            {children}
        </div>
        <Footer />
     </div>
    );
  }