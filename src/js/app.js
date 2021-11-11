// Register event listener for register button.
let registerButton = document.getElementById('register');
registerButton.addEventListener("click", register);

let alertDanger = document.getElementsByClassName('alert-danger')[0];
let alertSuccess = document.getElementsByClassName('alert-success')[0];

let spinner = document.getElementById('spinner');
/**
 * Validation rules.
 */
const rules = [
	{
		name: 'name',
		rules: ['required']
	},
	{
		name: 'email',
		rules: ['required', 'email']
	}
];

/**
 * Register user into the event.
 */
function register() {
	// Hide alert message.
	alertDanger.style.display = 'none';
	alertSuccess.style.display = 'none';

	// Validate form.
	const formValidation = new FormValidation();
	let validationResult = formValidation.validateForm(rules);

	let name = document.getElementsByName('name')[0];
	let email = document.getElementsByName('email')[0];

	// If validation passed, send request to the API to store the registration data.
	if (validationResult) {
		const httpRequest = new HttpRequest();
		httpRequest.post('http://localhost:8000/api/v1/events/subscribers', {'name': name.value, 'email': email.value})
			.then((data) => {
				alertSuccess.style.display = 'block';
				name.value = '';
				email.value = '';
			}).catch((error) => {
				if (error.response) {
					let errorResponse = JSON.parse(error.response);
					alertDanger.innerText = errorResponse.error.data[0];
				} else {
					alertDanger.innerText = 'Oops! Something wrong happened.'
				}

				alertDanger.style.display = 'block';
			})

		hideSpinner();
	}

	hideSpinner();
}

function showSpinner() {
	spinner.style.visibility = 'visible';
}

function hideSpinner() {
	spinner.style.visibility = 'hidden';
}

/**
 * Form validation
 */
class FormValidation {
	/**
	 * Validate required field.
	 *
	 * @param input
	 * @returns {boolean}
	 */
	validateRequired(input) {
		if (!input.value) {
			let errorMessage = input.name.charAt(0).toUpperCase() + input.name.slice(1) + " is required.";
			this.displayValidationErrorMessage(input, errorMessage)
			return false;
		}

		return true;
	}

	/**
	 * Validate email valid or not.
	 *
	 * @param input
	 * @returns {boolean}
	 */
	validateEmail(input) {
		let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

		if (input.value.match(emailRegex)) {
			return true;
		}

		let errorMessage = input.name.charAt(0).toUpperCase() + input.name.slice(1) + " is invalid.";
		this.displayValidationErrorMessage(input, errorMessage);

		return false;
	}

	/**
	 * Display validation error message.
	 *
	 * @param input
	 * @param message
	 * @returns {HTMLDivElement}
	 */
	displayValidationErrorMessage(input, message) {
		let errorMessage = document.createElement('div');
		errorMessage.className = 'error';
		errorMessage.innerText = message

		input.parentNode.insertBefore(errorMessage, input.nextSibling);
	}

	/**
	 * Clear validation error messages.
	 */
	clearValidationErrorMessages() {
		document.querySelectorAll(".error").forEach(el => el.remove());
	}

	/**
	 * Validate form.
	 *
	 * @param rules
	 * @returns {boolean}
	 */
	validateForm(rules) {
		this.clearValidationErrorMessages();

		let validationPassed = true;

		rules.forEach((rule) => {
			let input = document.getElementsByName(rule.name)[0];

			rule.rules.every((rule) => {
				let funcName = 'validate' + rule.charAt(0).toUpperCase() + rule.slice(1);

				let validationResult = this[funcName](input);

				if (!validationResult) {
					validationPassed = false;
					return false;
				}

				return true;
			});
		});

		return validationPassed;
	}
}

/**
 * Http Request.
 */
class HttpRequest {
	/**
	 * AJAX post request.
	 *
	 * @param url
	 * @param data
	 * @returns {Promise<unknown>}
	 */
	post(url, data) {
		return new Promise(function(resolve,reject) {
			let params = typeof data === 'string' ? data : Object.keys(data).map(
				function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
			).join('&');

			let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			xhr.open('POST', url);

			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText,
						response: xhr.response
					});
				}
			};

			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

			xhr.onerror = function() {
				reject({
					status: this.status,
					statusText: xhr.statusText,
					response: xhr.response
				});
			};

			xhr.send(params);
		});
	}
}