import { Menu, MenuItem } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Texture, TextureMCMeta } from "react-minecraft";
import { ModalData } from "./page";

interface props {
	filePath: string;
	resolution: 'x16' | 'x32';
	openModal: (data: ModalData) => void;
}

export function MenuHolder({ filePath, resolution, openModal }: props) {
	const [texture, setTexture] = useState<string>('data:image/png;base64,');
	const [mcmeta, setMcmeta] = useState<Required<Pick<TextureMCMeta, 'animation'>> | null>(null);

	useEffect(() => {
		void fetch(`/api/texture?path=${encodeURIComponent(filePath)}&resolution=${resolution}`)
			.then((res) => res.json())
			.then(({ texture: textureData, mcmeta: mcmetaData }) => {
				setTexture(textureData);
				setMcmeta(mcmetaData);
			})
			.catch(() => null);
	}, [filePath, resolution]);

	const os = useOs();

	return (
		<Menu
			position="right-start"
		>
			<Menu.Target>
				<div>
					{mcmeta && (
						<Texture
							src={texture}
							animation={{ mcmeta, tiled: filePath.toLowerCase().includes('flow') && !filePath.toLowerCase().endsWith('.flowing.png') }}
							size={100}
						/>
					)}
					{!mcmeta && (
						<Texture
							src={texture}
							size={100}
						/>
					)}
				</div>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>Preview</Menu.Label>
				<MenuItem
					onClick={() => {
						openModal({
							src: texture,
							animation: mcmeta 
								? {
										mcmeta,
										tiled: filePath.toLowerCase().includes('flow') && !filePath.toLowerCase().endsWith('.flowing.png'),
									}
								: undefined,
						})
					}}
				>
					Fullscreen Preview
				</MenuItem>
				<Menu.Item
					disabled={os !== 'windows'}
					onClick={() => void fetch('/api/tools/open-file', {
						method: 'POST',
						body: JSON.stringify({ filePath, resolution }),
					})}
				>
					Reveal in File Explorer
				</Menu.Item>
				<Menu.Label>Tools</Menu.Label>
				<MenuItem
					onClick={() => navigator.clipboard.writeText(filePath)}
				>
					Copy assets path
				</MenuItem>
				{resolution === 'x16' && (
					<MenuItem
						onClick={() => void fetch('/api/tools/copy-paste-to-x32', { 
							method: 'POST', 
							body: JSON.stringify({ filePath }),
						})}
					>
						Copy to x32
					</MenuItem>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};