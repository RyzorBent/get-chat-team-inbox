import React, { useEffect, useRef, useState } from 'react';
import '../styles/SearchMessage.css';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_GO_TO_MSG_ID } from '../Constants';
import SearchBar from './SearchBar';
import { useParams } from 'react-router-dom';
import SearchMessageResult from './SearchMessageResult';
import { isMobileOnly } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../contexts/ApplicationContext';
import { generateCancelToken } from '../helpers/ApiHelper';
import { CancelTokenSource } from 'axios';
import { useAppDispatch } from '@src/store/hooks';
import { setSearchMessagesVisible } from '@src/store/reducers/UIReducer';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { Message } from '@src/types/messages';
import { fetchMessages } from '@src/api/messagesApi';
import { prepareMessageList } from '@src/helpers/MessageHelper';

export type Props = {
	initialKeyword: string;
	setInitialKeyword: (_keyword: string) => void;
};

const SearchMessage: React.FC<Props> = ({
	initialKeyword,
	setInitialKeyword,
}) => {
	const dispatch = useAppDispatch();

	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const { t } = useTranslation();

	const [results, setResults] = useState<ChatMessageList>({});
	const [keyword, setKeyword] = useState('');
	const [isLoading, setLoading] = useState(false);

	const timer = useRef<NodeJS.Timeout>();

	const { waId } = useParams();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			// Escape
			if (event.key === 'Escape') {
				close();
				event.stopPropagation();
			}
		};

		document.addEventListener('keydown', handleKey);

		return () => {
			document.removeEventListener('keydown', handleKey);

			// Clear initial keyword for next session
			setInitialKeyword('');
		};
	}, []);

	useEffect(() => {
		setResults({});
	}, [waId]);

	useEffect(() => {
		timer.current = setTimeout(() => {
			search();
		}, 500);

		return () => {
			clearTimeout(timer.current);
		};
	}, [keyword]);

	useEffect(() => {
		if (initialKeyword) {
			setKeyword(initialKeyword);
		}
	}, [initialKeyword]);

	const close = () => {
		dispatch(setSearchMessagesVisible(false));
	};

	let cancelTokenSourceRef = useRef<CancelTokenSource | undefined>();

	const search = async () => {
		// Check if there are any previous pending requests
		if (cancelTokenSourceRef.current) {
			cancelTokenSourceRef.current.cancel(
				'Operation canceled due to new request.'
			);
		}

		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		if (keyword.trim().length === 0) {
			setResults({});
			return false;
		}

		setLoading(true);

		try {
			// TODO: Make request cancellable
			const data = await fetchMessages({
				wa_id: waId,
				search: keyword,
				limit: 30,
			});
			const preparedMessages = prepareMessageList(data.results);
			setResults(preparedMessages);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const goToMessage = (data: Message) => {
		PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, data);

		if (isMobileOnly) {
			close();
		}
	};

	return (
		<div className="searchMessage">
			<div className="searchMessage__header">
				<IconButton onClick={close} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Search For Messages')}</h3>
			</div>

			<SearchBar value={keyword} onChange={setKeyword} isLoading={isLoading} />

			<div className="searchMessage__body">
				{Object.entries(results).map((message) => (
					<SearchMessageResult
						key={message[0]}
						messageData={message[1]}
						keyword={keyword}
						onClick={goToMessage}
						displaySender={false}
					/>
				))}
			</div>
		</div>
	);
};

export default SearchMessage;
