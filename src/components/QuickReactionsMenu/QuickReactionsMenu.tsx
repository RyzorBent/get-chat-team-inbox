import React from 'react';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import PrintMessage from '@src/components/PrintMessage';
import { Menu } from '@mui/material';
import styles from './QuickReactionsMenu.module.css';

interface Props {
	message: ChatMessageModel | null;
	anchorElement: HTMLElement | null;
	setAnchorElement: (anchorElement: HTMLElement | null) => void;
	onReaction: (messageId: string, emoji: string | null) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const QuickReactionsMenu: React.FC<Props> = ({
	message,
	anchorElement,
	setAnchorElement,
	onReaction,
}) => {
	const hide = () => {
		setAnchorElement(null);
	};

	return (
		<Menu
			anchorEl={anchorElement}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
			transformOrigin={{ vertical: 'center', horizontal: 'center' }}
			open={Boolean(anchorElement)}
			onClose={() => setAnchorElement(null)}
			elevation={0}
			disableAutoFocusItem={true}
			className={styles.menu}
		>
			<div className={styles.reactions}>
				{EMOJIS.map((emoji) => (
					<div
						key={emoji}
						onClick={() => {
							if (message?.id) {
								onReaction(message.id, emoji);
							}
							hide();
						}}
					>
						<PrintMessage message={emoji} smallEmoji />
					</div>
				))}
			</div>
		</Menu>
	);
};

export default QuickReactionsMenu;
