import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ButtonBase } from '@mui/material';

import styles from './ContactsMessage.module.css';
import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import CustomAvatar from '@src/components/CustomAvatar';
import ChatIcon from '@mui/icons-material/Chat';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface Props {
	data: ChatMessageModel;
}

const ContactsMessage: React.FC<Props> = ({ data }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { contacts } = data?.payload || data?.resendPayload;

	const handleClick = (targetWaId: string) => {
		const waId = prepareWaId(targetWaId);
		navigate(`/main/chat/${waId}${location.search}`);
	};

	return (
		<div className={styles.root}>
			{contacts?.map((contact: any, contactIndex: number) => (
				<div key={contactIndex} className={styles.item}>
					<div className={styles.header}>
						<>
							<CustomAvatar
								className={styles.avatar}
								generateBgColorBy={contact.name?.formatted_name}
							>
								{generateInitialsHelper(contact.name?.formatted_name ?? '')}
							</CustomAvatar>
							<div key={contactIndex} className={styles.name}>
								{contact.name?.formatted_name ?? ''}
							</div>
						</>
					</div>
					<div className={styles.footer}>
						{contact.phones?.map((phoneObj: any, phoneObjIndex: number) => (
							<ButtonBase
								key={phoneObjIndex}
								className={styles.messageButton}
								onClick={() => handleClick(phoneObj.wa_id)}
							>
								<ChatIcon className={styles.messageButtonIcon} />
								<div className={styles.phoneNumberContainer}>
									{phoneObj?.type && (
										<div className={styles.phoneNumberType}>
											{phoneObj.type}
										</div>
									)}
									<div className={styles.phoneNumber}>
										{phoneObj.phone ?? phoneObj.wa_id}
									</div>
								</div>
							</ButtonBase>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default ContactsMessage;
