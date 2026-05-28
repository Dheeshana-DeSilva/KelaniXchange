import { Link, Navigate, useLocation } from "react-router";
import {
    AlertTriangle,
    CheckCircle2,
    HelpCircle,
    LockKeyhole,
    Mail,
    MessageCircle,
    ShieldCheck,
    Store,
} from "lucide-react";

const pageContent = {
    contact: {
        eyebrow: "Contact",
        title: "Contact KelaniXchange",
        intro: "Need help with an order, exchange, listing, report, or account issue? Use the contact paths below so the right person can respond.",
        icon: Mail,
        sections: [
            {
                title: "General Support",
                body: "For marketplace questions, account issues, payment proof problems, or feedback about the platform, contact the KelaniXchange support team.",
                items: ["Email: kelanixchange@gmail.com", "Response time: usually within 1-2 working days", "Include your listing, order, or exchange ID when possible"],
            },
            {
                title: "Safety Or Reports",
                body: "If a listing, review, message, or user looks suspicious, use the report option inside the relevant page. Admins can review reports and take action.",
                items: ["Report fake listings", "Report inappropriate reviews", "Report unsafe messages or behavior"],
            },
            {
                title: "Campus Meetups",
                body: "KelaniXchange does not handle physical item delivery. Buyers and sellers should agree on a safe public campus location before completing handover.",
                items: ["Meet in visible public areas", "Confirm item condition before payment", "Keep chat history inside the platform"],
            },
        ],
    },
    help: {
        eyebrow: "Help Center",
        title: "How To Use KelaniXchange",
        intro: "A quick guide for buying, selling, exchanging, and managing your student marketplace activity.",
        icon: HelpCircle,
        sections: [
            {
                title: "Buying An Item",
                body: "Browse the marketplace, open a listing, check seller details, then add the item to cart or use buy now. After checkout, track the order from My Orders.",
                items: ["Check price, condition, quantity, and location", "Chat with the seller before handover", "Mark the experience with feedback after completion"],
            },
            {
                title: "Selling An Item",
                body: "Create a listing with clear details, photos, price, and available quantity. Orders for your listings appear in My Sales.",
                items: ["Keep listing details accurate", "Update handover and payment status", "Cancel only when the handover cannot continue"],
            },
            {
                title: "Exchanging Items",
                body: "If a listing allows exchanges, offer one of your own listings. Accepted exchanges can be marked completed, then feedback becomes available.",
                items: ["Only offer items you own", "Use chat to agree on condition and handover", "Delete completed, cancelled, or rejected exchange records from your history when needed"],
            },
            {
                title: "Lost And Found",
                body: "Post found items or search for lost belongings. Add useful descriptions and campus locations to help the owner identify the item.",
                items: ["Avoid sharing sensitive personal data publicly", "Use clear photos when appropriate", "Update the post once the item is returned"],
            },
        ],
    },
    safety: {
        eyebrow: "Safety",
        title: "Safety Tips For Student Trading",
        intro: "KelaniXchange is built for the Kelaniya community, but every handover still needs common-sense safety checks.",
        icon: ShieldCheck,
        sections: [
            {
                title: "Before You Meet",
                body: "Review the listing, seller profile, ratings, and chat details before agreeing to a handover.",
                items: ["Ask for extra photos if needed", "Confirm price and quantity in chat", "Avoid deals that move conversation to unknown channels too quickly"],
            },
            {
                title: "During Handover",
                body: "Meet in public campus areas and inspect the item before completing payment or marking the order completed.",
                items: ["Bring a friend for higher value items", "Check condition, accessories, and working status", "Do not rush payment before inspection"],
            },
            {
                title: "After The Deal",
                body: "Use platform feedback to help other students understand the seller's reliability.",
                items: ["Rate only completed orders or exchanges", "Keep comments honest and respectful", "Report unsafe or inappropriate behavior"],
            },
        ],
    },
    terms: {
        eyebrow: "Terms",
        title: "Terms And Conditions",
        intro: "These terms explain the basic responsibilities for using KelaniXchange as a student marketplace.",
        icon: CheckCircle2,
        sections: [
            {
                title: "User Responsibility",
                body: "Users are responsible for the accuracy of their listings, messages, prices, payment details, and handover arrangements.",
                items: ["Do not list fake, stolen, unsafe, or prohibited items", "Do not impersonate another user", "Do not misuse reviews, reports, chat, or notifications"],
            },
            {
                title: "Orders And Exchanges",
                body: "KelaniXchange helps record marketplace activity, but buyers and sellers are responsible for confirming item condition and completing handover safely.",
                items: ["Only completed orders or exchanges can receive feedback", "One review is allowed per completed transaction", "Cancelled or completed records may be hidden from your own history"],
            },
            {
                title: "Admin Actions",
                body: "Admins may remove inappropriate listings, reviews, lost-and-found posts, users, or reports when needed to protect the platform.",
                items: ["Reported content may be reviewed", "Unsafe behavior can lead to account action", "Platform rules may be updated as the system improves"],
            },
        ],
    },
    privacy: {
        eyebrow: "Privacy",
        title: "Privacy Policy",
        intro: "KelaniXchange uses account, listing, order, exchange, review, and message data to operate the marketplace safely.",
        icon: LockKeyhole,
        sections: [
            {
                title: "Information We Use",
                body: "The platform stores the details needed to support your account and marketplace activity.",
                items: ["Profile and contact details you provide", "Listings, images, orders, exchanges, reviews, reports, and chats", "Payment references or uploaded proof when used for bank transfer orders"],
            },
            {
                title: "How It Helps The Platform",
                body: "Your information is used to show listings, connect buyers and sellers, send notifications, prevent misuse, and support admin review.",
                items: ["Display seller profiles and ratings", "Track order and exchange status", "Support reports, moderation, and account security"],
            },
            {
                title: "Your Choices",
                body: "You can update your profile, manage listings, remove eligible order or exchange records from your own history, and report content that concerns you.",
                items: ["Keep account details current", "Avoid sharing sensitive information in public listing text", "Use chat and reports responsibly"],
            },
        ],
    },
};

const relatedLinks = [
    { label: "Marketplace", to: "/marketplace", icon: Store },
    { label: "Messages", to: "/chats", icon: MessageCircle },
    { label: "Reports & Safety", to: "/safety", icon: AlertTriangle },
];

export default function FooterInfo() {
    const { pathname } = useLocation();
    const slug = pathname.replace("/", "");
    const page = pageContent[slug];

    if (!page) {
        return <Navigate to="/" replace />;
    }

    const Icon = page.icon;

    return (
        <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-8 sm:pt-32">
            <div className="mx-auto max-w-[1120px] space-y-8">
                <section className="border-b border-slate-200 pb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#15945a]">
                        <Icon size={14} />
                        {page.eyebrow}
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        {page.title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                        {page.intro}
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    {page.sections.map((section) => (
                        <article key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-black text-slate-900">{section.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{section.body}</p>
                            <ul className="mt-4 space-y-2">
                                {section.items.map((item) => (
                                    <li key={item} className="flex gap-2 text-sm font-medium leading-6 text-slate-600">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#15945a]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Useful Links</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {relatedLinks.map(({ label, to, icon: LinkIcon }) => (
                            <Link
                                key={to}
                                to={to}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#15945a]"
                            >
                                <LinkIcon size={14} />
                                {label}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
