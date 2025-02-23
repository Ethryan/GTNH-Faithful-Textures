import { Menu, MenuItem } from "@mantine/core";
import { useEffect, useState } from "react";
import { Texture, TextureMCMeta } from "react-minecraft";

interface props {
	filePath: string;
	resolution: 'x16' | 'x32';
}

export function MenuHolder({ filePath, resolution }: props) {
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
							size="120px"
						/>
					)}
					{!mcmeta && (
						<Texture
							src={texture}
							size="120px"
						/>
					)}
				</div>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>Tools</Menu.Label>
				<Menu.Item 
					onClick={() => void fetch('/api/tools/open-file', {
						method: 'POST',
						body: JSON.stringify({ filePath, resolution }),
					})}
				>
					Reveal in File Explorer
				</Menu.Item>
				<MenuItem
					onClick={() => navigator.clipboard.writeText(filePath)}
				>
					Copy file path
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