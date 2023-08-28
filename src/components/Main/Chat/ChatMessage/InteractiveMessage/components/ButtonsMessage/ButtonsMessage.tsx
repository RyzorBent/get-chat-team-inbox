// @ts-nocheck
import React from 'react';
import { Button } from '@mui/material';

import styles from './ButtonsMessage.module.css';
import PrintMessage from '@src/components/PrintMessage';

const ButtonsMessage = ({ header, body, footer, action }) => {
	return (
		<>
			{header && (
				<div className={styles.header}>
					<PrintMessage linkify message={header.text} />
				</div>
			)}
			{body && (
				<div className={styles.body}>
					<PrintMessage linkify message={body.text} />
				</div>
			)}
			{footer && (
				<div className={styles.footer}>
					<PrintMessage linkify message={footer.text} />
				</div>
			)}
			{action?.buttons && Array.isArray(action?.buttons) && (
				<div className={styles.actions}>
					{action?.buttons.map(({ reply }, index) => (
						<Button key={reply?.id ?? index} color="primary" fullWidth disabled>
							{reply?.title}
						</Button>
					))}
				</div>
			)}
		</>
	);
};

export default ButtonsMessage;
