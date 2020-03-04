export class UserDetailsResult {

	id: string;
	firstName: string;
	lastName: string;
	organisation: string;
	jobTitle: string;
	userRole: string;
	groups: any[];
	emailAddress: any;
}

export class EditableUserDetails {

	id: string;
	deletePending: boolean;
	username:string;
	firstName: string;
	lastName: string;
	organisation: string;
	jobTitle: string;
	visible: boolean;
	validationError: boolean;
	
	show() {
	}

	cancel() {
	}

	save(parent: any) {
	}
}