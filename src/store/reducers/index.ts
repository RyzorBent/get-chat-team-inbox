import UIReducer from './UIReducer';
import chatsReducer from './chatsReducer';
import templatesReducer from './templatesReducer';
import savedResponsesReducer from './savedResponsesReducer';
import usersReducer from './usersReducer';
import currentUserReducer from './currentUserReducer';
import groupsReducer from './groupsReducer';
import filterTagIdReducer from './filterTagReducerId';
import chatsCountReducer from './chatsCountReducer';
import tagsReducer from './tagsReducer';
import previewMediaObjectReducer from './previewMediaObjectReducer';
import isRefreshingTemplatesReducer from './isRefreshingTemplatesReducer';

const rootReducer = {
	UI: UIReducer,
	chats: chatsReducer,
	templates: templatesReducer,
	savedResponses: savedResponsesReducer,
	tags: tagsReducer,
	users: usersReducer,
	currentUser: currentUserReducer,
	groups: groupsReducer,
	filterTagId: filterTagIdReducer,
	chatsCount: chatsCountReducer,
	previewMediaObject: previewMediaObjectReducer,
	isRefreshingTemplates: isRefreshingTemplatesReducer,
};

export default rootReducer;
