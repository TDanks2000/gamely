"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// Modern, safe base64 helpers for JSON
function encodeBase64(obj: unknown) {
	// Encode JSON to UTF-8, then to base64
	return btoa(
		encodeURIComponent(JSON.stringify(obj)).replace(
			/%([0-9A-F]{2})/g,
			(_, p1) => String.fromCharCode(Number.parseInt(p1, 16)),
		),
	);
}

function decodeBase64(str: string) {
	// Decode base64 to UTF-8, then to JSON
	return JSON.parse(
		decodeURIComponent(
			Array.prototype.map
				.call(
					atob(str),
					(c: string) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`,
				)
				.join(""),
		),
	);
}

export default function Home() {
	const gameFrame = useRef<HTMLIFrameElement>(null);
	const [expanded, setExpanded] = useState(false);

	// Remove scrollbar from body when expanded
	useEffect(() => {
		if (expanded) {
			document.body.classList.add("overflow-hidden");
		} else {
			document.body.classList.remove("overflow-hidden");
		}
		return () => {
			document.body.classList.remove("overflow-hidden");
		};
	}, [expanded]);

	useEffect(() => {
		function handleMessage(event: MessageEvent) {
			// You can check event.origin here for security
			if (event.data?.type && event.data.base64) {
				try {
					console.log(`parent: ${event.data.base64}`);
					// You can show a toast or update state here if you want
				} catch (e) {
					console.error("Failed to decode base64:", event.data.base64);
				}
			}
			if (event.data === "fullscreen") {
				setExpanded(true);
			}
		}
		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	// Send base64-encoded SAVE message
	const sendSave = () => {
		if (!gameFrame.current) return;
		const payload = {
			saveId: `parent_save_${Date.now()}`,
			data: {
				coins: 999,
				inventory: ["parent_sword", "parent_shield"],
				timestamp: new Date().toISOString(),
			},
		};
		gameFrame.current.contentWindow?.postMessage(
			{
				type: "SAVE",
				base64: encodeBase64(payload),
			},
			"*",
		);
	};

	// Send base64-encoded CLOUD message
	const sendCloud = () => {
		if (!gameFrame.current) return;
		const payload = {
			user: "parent_player",
			cloudData: {
				achievements: ["parent_achievement"],
				lastSync: new Date().toISOString(),
			},
		};
		gameFrame.current.contentWindow?.postMessage(
			{
				type: "CLOUD",
				base64: encodeBase64(payload),
			},
			"*",
		);
	};

	return (
		<div
			className={cn(
				"flex min-h-[100svh] min-w-[100svw] items-start justify-center transition-all",
				{
					"p-0": expanded,
				},
			)}
		>
			<Card
				className={cn(
					"relative h-[90svh] w-full max-w-[90svw] rounded-lg pt-0 shadow-lg transition-all",
					{
						"fixed inset-0 z-50 h-[100svh] w-[100svw] max-w-none rounded-none p-0 shadow-none":
							expanded,
					},
				)}
			>
				<CardContent
					className={cn("size-full p-4 transition-all", {
						"p-0": expanded,
					})}
				>
					<div className="relative h-full w-full">
						<iframe
							ref={gameFrame}
							title="Gacha"
							className={cn(
								"h-full w-full rounded-lg border-0 transition-all",
								{
									"rounded-none": expanded,
								},
							)}
							allowFullScreen
							src={"/test-iframe-content.html"}
						/>
					</div>
				</CardContent>
				{expanded ? (
					<div
						className={cn(
							"group -translate-x-1/2 absolute bottom-8 left-1/2 z-50",
						)}
					>
						<CardFooter
							className={cn(
								"flex flex-row justify-center gap-4 bg-transparent p-0",
								"pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
								"transition-opacity duration-300",
							)}
						>
							<Button
								onClick={() => {
									if (gameFrame.current) gameFrame.current.requestFullscreen();
								}}
							>
								Fullscreen
							</Button>
							<Button
								variant="secondary"
								onClick={() => setExpanded(false)}
								className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
							>
								Collapse
							</Button>
							<Button onClick={sendSave} variant="outline">
								Send SAVE
							</Button>
							<Button onClick={sendCloud} variant="outline">
								Send CLOUD
							</Button>
						</CardFooter>
					</div>
				) : (
					<CardFooter className="flex flex-row justify-center gap-4 p-4 transition-all">
						<Button
							onClick={() => {
								if (gameFrame.current) gameFrame.current.requestFullscreen();
							}}
						>
							Fullscreen
						</Button>
						<Button onClick={() => setExpanded(true)}>Expand</Button>
						<Button onClick={sendSave} variant="outline">
							Send SAVE
						</Button>
						<Button onClick={sendCloud} variant="outline">
							Send CLOUD
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
