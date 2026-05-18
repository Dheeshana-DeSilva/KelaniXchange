import { Link } from "react-router";

function Footer() {
    return (
        <footer className="bg-white px-6 py-12 sm:px-8 border-t border-slate-100">
            <div className="mx-auto grid max-w-[1450px] gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <h2 className="text-xl font-black text-[#13253f]">
                        <span className="text-[#15945a]">Kelani</span>
                        <span className="text-[#13253f]">Xchange</span>
                    </h2>

                    <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
                        A trusted student marketplace to buy, sell, and exchange
                        items within the Kelaniya community.
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-extrabold text-[#13253f]">
                        Quick Links
                    </h3>

                    <div className="flex flex-col space-y-2.5 text-sm text-slate-500">
                        <Link to="/marketplace" className="hover:text-[#15945a] transition">Marketplace</Link>
                        <a href="/#how-it-works" className="hover:text-[#15945a] transition">How It Works</a>
                        <Link to="/about" className="hover:text-[#15945a] transition">About Us</Link>
                        <Link to="/contact" className="hover:text-[#15945a] transition">Contact Us</Link>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-extrabold text-[#13253f]">
                        Support
                    </h3>

                    <div className="flex flex-col space-y-2.5 text-sm text-slate-500">
                        <Link to="/help" className="hover:text-[#15945a] transition">Help Center</Link>
                        <Link to="/safety" className="hover:text-[#15945a] transition">Safety Tips</Link>
                        <Link to="/terms" className="hover:text-[#15945a] transition">Terms & Conditions</Link>
                        <Link to="/privacy" className="hover:text-[#15945a] transition">Privacy Policy</Link>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-extrabold text-[#13253f]">
                        Stay Connected
                    </h3>

                    <p className="text-sm leading-6 text-slate-500">
                        Follow future updates and announcements from
                        KelaniXchange.
                    </p>
                    
                    <div className="mt-4 flex gap-4">
                        {/* Social icons could go here */}
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-12 max-w-[1450px] border-t border-slate-100 pt-8 text-center">
                <p className="text-xs font-medium text-slate-400">
                    © {new Date().getFullYear()} KelaniXchange. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
