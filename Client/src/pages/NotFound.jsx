import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<section className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
			<div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
				<span className="mb-6 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300">
					404 • Not Found
				</span>
				<h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
					Oops! The page you are looking for has drifted off.
				</h1>
				<p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
					The content might have moved, or the link you followed could be outdated. Let&apos;s guide you back to where the journey continues.
				</p>

				<div className="mt-10 grid w-full gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
					<div className="grid gap-2 text-left">
						<h2 className="text-lg font-semibold text-slate-100">Need a hand?</h2>
						<p className="text-sm text-slate-400">
							Check the navigation bar or head back to the dashboard for the latest workforce insights and tools.
						</p>
					</div>
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<div className="text-sm text-slate-400">
							Tip: Bookmark frequently used pages so you never lose your place.
						</div>
						<Button onClick={() => navigate("/")} className="group">
							<ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
							Return Home
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}