import React from 'react';
import Alert from '@mui/material/Alert';
import TemplatesList from '../TemplatesList';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { Template } from '@src/types/templates';

export type Props = {
	onSelect: (template: Template) => void;
};

const TemplateListWithControls: React.FC<Props> = ({ onSelect }) => {
	const { t } = useTranslation();
	const { isLoadingTemplates } = useAppSelector((state) => state.UI);

	return (
		<div className="templateMessagesOuter">
			{/*<SearchBar />*/}

			{isLoadingTemplates ? (
				<Alert severity="info">{t('Loading template messages...')}</Alert>
			) : (
				<TemplatesList
					onClick={onSelect}
					displayRegisterTemplate={true}
					customSelectButtonTitle={undefined}
				/>
			)}
		</div>
	);
};

export default TemplateListWithControls;
