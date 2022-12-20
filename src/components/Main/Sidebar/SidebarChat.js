import React, { useEffect, useState } from 'react';
import '../../../styles/SidebarChat.css';
import { Badge, Checkbox, ListItem, Tooltip } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import LabelIcon from '@mui/icons-material/Label';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import Moment from 'react-moment';
import moment from 'moment';
import {
	extractAvatarFromContactProviderData,
	generateInitialsHelper,
} from '@src/helpers/Helpers';
import { getDroppedFiles, handleDragOver } from '@src/helpers/FileHelper';
import PubSub from 'pubsub-js';
import {
	CALENDAR_SHORT,
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
	EVENT_TOPIC_DROPPED_FILES,
} from '@src/Constants';
import ChatMessageShortContent from '../Chat/ChatMessage/ChatMessageShortContent';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';

function SidebarChat(props) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const [isSelected, setSelected] = useState(false);
	const [isExpired, setExpired] = useState(props.chatData.isExpired);
	const [timeLeft, setTimeLeft] = useState();
	const [remainingSeconds, setRemainingSeconds] = useState();
	const { waId } = useParams();

	useEffect(() => {
		setSelected(props.selectedChats.includes(props.chatData.waId));
	}, [props.selectedChats]);

	const generateTagNames = () => {
		const generatedTagNames = [];
		props.chatData.tags?.forEach((tag) => {
			generatedTagNames.push(tag.name);
		});
		return generatedTagNames.join(', ');
	};

	useEffect(() => {
		function calculateRemaining() {
			const momentDate = moment.unix(
				props.chatData.lastReceivedMessageTimestamp
			);
			momentDate.add(1, 'day');
			const curDate = moment(new Date());
			const hours = momentDate.diff(curDate, 'hours');
			const seconds = momentDate.diff(curDate, 'seconds');

			setRemainingSeconds(seconds);

			let suffix;

			if (hours > 0) {
				suffix = 'h';
				setTimeLeft(hours + suffix);
			} else {
				const minutes = momentDate.diff(curDate, 'minutes');
				if (minutes > 1) {
					suffix = 'm';
					setTimeLeft(minutes + suffix);
				} else {
					if (seconds > 1) {
						suffix = 'm';
						setTimeLeft(minutes + suffix);
					} else {
						// Expired
						setExpired(true);
					}
				}
			}
		}

		setExpired(props.chatData.isExpired);

		// Initial
		calculateRemaining();

		let intervalId;
		if (!isExpired) {
			intervalId = setInterval(() => {
				calculateRemaining();
			}, 30000);
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [
		isExpired,
		props.chatData.isExpired,
		props.chatData.lastMessageTimestamp,
	]);

	const handleDroppedFiles = (event) => {
		if (isExpired) {
			event.preventDefault();
			return;
		}

		// Preparing dropped files
		const files = getDroppedFiles(event);

		// Switching to related chat
		navigate(`/main/chat/${props.chatData.waId}`);

		// Sending files via eventbus
		PubSub.publish(EVENT_TOPIC_DROPPED_FILES, files);
	};

	const handleClick = () => {
		if (props.isSelectionModeEnabled) {
			if (isDisabled()) return;

			let newSelectedState = !isSelected;

			props.setSelectedChats((prevState) => {
				if (newSelectedState) {
					if (!prevState.includes(props.chatData.waId)) {
						prevState.push(props.chatData.waId);
					}
				} else {
					prevState = prevState.filter(
						(arrayItem) => arrayItem !== props.chatData.waId
					);
				}

				return [...prevState];
			});
		} else {
			navigate(`/main/chat/${props.chatData.waId}`);
		}
	};

	const isDisabled = () => {
		return isExpired && props.bulkSendPayload?.type !== 'template';
	};

	const hasFailedMessages = () => {
		let result = false;
		props.pendingMessages.forEach((pendingMessage) => {
			if (
				pendingMessage.requestBody?.wa_id === props.chatData.waId &&
				pendingMessage.isFailed === true
			)
				result = true;
		});

		return result;
	};

	const newMessages = props.newMessages[props.chatData.waId]?.newMessages;

	return (
		<ListItem button onClick={handleClick}>
			<div
				id={props.chatData.waId}
				className={
					'sidebarChatWrapper ' +
					(waId === props.chatData.waId ? 'activeChat ' : '') +
					(isExpired
						? 'expired '
						: remainingSeconds < 8 * 60 * 60
						? 'almostExpired '
						: '') +
					(props.isSelectionModeEnabled && isSelected ? 'isSelected ' : '')
				}
				onDrop={(event) => handleDroppedFiles(event)}
				onDragOver={(event) => handleDragOver(event)}
			>
				<div className="sidebarChat">
					{props.isSelectionModeEnabled && (
						<Checkbox
							className="sidebarChat__selection"
							checked={isSelected}
							color="primary"
							disabled={isDisabled()}
						/>
					)}

					<div className="sidebarChat__avatarWrapper">
						<CustomAvatar
							className="sidebarChat__avatarWrapper__mainAvatar"
							src={extractAvatarFromContactProviderData(
								props.contactProvidersData[props.chatData.waId]
							)}
							style={
								isExpired
									? {}
									: {
											backgroundColor: generateAvatarColor(props.chatData.name),
									  }
							}
						>
							{props.chatData.initials}
						</CustomAvatar>

						{props.chatData.assignedToUser &&
							(props.tabCase === CHAT_LIST_TAB_CASE_ALL ||
								props.tabCase === CHAT_LIST_TAB_CASE_GROUP) && (
								<Tooltip title={props.chatData.generateAssignmentInformation()}>
									<CustomAvatar
										className="sidebarChat__avatarWrapper__assignee"
										style={{
											backgroundColor: generateAvatarColor(
												props.chatData.getAssignedUserUsername()
											),
										}}
									>
										{generateInitialsHelper(
											props.chatData.generateAssignedToInitials()
										)}
									</CustomAvatar>
								</Tooltip>
							)}

						{props.chatData.assignedGroup &&
							((props.tabCase === CHAT_LIST_TAB_CASE_ALL &&
								!props.chatData.assignedToUser) ||
								props.tabCase === CHAT_LIST_TAB_CASE_ME ||
								(props.tabCase === CHAT_LIST_TAB_CASE_GROUP &&
									!props.chatData.assignedToUser)) && (
								<Tooltip title={props.chatData.generateAssignmentInformation()}>
									<CustomAvatar
										className="sidebarChat__avatarWrapper__assignee"
										style={{
											backgroundColor: generateAvatarColor(
												props.chatData.assignedGroup?.name
											),
										}}
									>
										<GroupIcon />
									</CustomAvatar>
								</Tooltip>
							)}
					</div>

					<div className="sidebarChat__info">
						<div className="sidebarChat__info__nameWrapper">
							<h2>
								{props.keyword !== undefined &&
								props.keyword.trim().length > 0 ? (
									<PrintMessage
										message={props.chatData.name}
										highlightText={props.keyword}
									/>
								) : (
									<PrintMessage
										message={
											props.contactProvidersData[props.chatData.waId]?.[0]
												?.name ?? props.chatData.name
										}
									/>
								)}

								{props.chatData.tags?.length > 0 && (
									<div className="sidebarChat__info__tags">
										<Tooltip title={generateTagNames()}>
											<LabelIcon
												className={
													props.chatData.tags.length > 1 ? 'multiple' : ''
												}
												style={{
													fill: props.chatData.tags[0].web_inbox_color,
												}}
											/>
										</Tooltip>
									</div>
								)}
							</h2>

							<div className="sidebarChat__info__date">
								{props.chatData.lastMessageTimestamp && (
									<Moment
										className="sidebarChat__info__nameWrapper__lastMessageDate"
										date={props.chatData.lastMessageTimestamp}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}

								{!isExpired && (
									<span className="sidebarChat__info__date__timeLeft">
										{t('%s left', timeLeft)}
									</span>
								)}
							</div>

							{newMessages > 0 && (
								<div className="sidebarChat__info__newMessagesBadge">
									{newMessages > 99 ? '99+' : newMessages}
								</div>
							)}
						</div>

						<div className="sidebarChat__info__lastMessage">
							<div className="sidebarChat__info__lastMessage__body">
								<ChatMessageShortContent
									type={props.chatData.lastMessageType}
									buttonText={props.chatData.lastMessageButtonText}
									interactiveButtonText={props.chatData.interactiveButtonText}
									text={props.chatData.lastMessageBody}
									caption={props.chatData.lastMessageCaption}
									isLastMessageFromUs={props.chatData.isLastMessageFromUs}
								/>
							</div>
						</div>
					</div>
				</div>

				<span className="sidebarChatWrapper__waId">
					{addPlus(props.chatData.waId)}
				</span>

				{hasFailedMessages() && (
					<div className="sidebarChat__failedMessagesIndicator">
						<Tooltip title={t('This chat has failed messages!')}>
							<WarningIcon className="error" />
						</Tooltip>
					</div>
				)}
			</div>
		</ListItem>
	);
}

export default SidebarChat;
