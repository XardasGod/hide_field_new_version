function applyPhoneMask(input) {
    var keyCode;
    function mask(event) {
        event.keyCode && (keyCode = event.keyCode);
        var pos = this.selectionStart;
        if (pos < 3) event.preventDefault();
        var matrix = "+7 (___) ___ ____",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = this.value.replace(/\D/g, ""),
            new_value = matrix.replace(/[_\d]/g, function (a) {
                return i < val.length ? val.charAt(i++) || def.charAt(i) : a
            });
        i = new_value.indexOf("_");
        if (i != -1) {
            i < 5 && (i = 3);
            new_value = new_value.slice(0, i)
        }
        var reg = matrix.substr(0, this.value.length).replace(/_+/g,
            function (a) {
                return "\\d{1," + a.length + "}"
            }).replace(/[+()]/g, "\\$&");
        reg = new RegExp("^" + reg + "$");
        if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
        if (event.type == "blur" && this.value.length < 5) this.value = ""
    }

    input.addEventListener("input", mask, false);
    input.addEventListener("focus", mask, false);
    input.addEventListener("blur", mask, false);
    input.addEventListener("keydown", mask, false);
}
function fixPhoneNumber(phoneNumber){ //иногда получается ввести цифр больше допустимого
    if (phoneNumber.length >= 18) {
       return phoneNumber.slice(0, -1);
    }
    return phoneNumber
}
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+7 \(\d{3}\) \d{3} \d{4}$/;
    return phoneRegex.test(phoneNumber);
}

async function sendNumber(data, url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
    } catch (error) {

    }
}

export function renderPhoneInput(mountPoint, url) {
    // Create a container for the title, input, and error message
    const fieldContainer = document.createElement('div');
    fieldContainer.classList.add("widget_settings_block__item_field");

    // Create the title element
    const titleField = document.createElement('div');
    titleField.classList.add("widget_settings_block__title_field");
    titleField.textContent = "Для активации виджета введите свой номер телефона для тех. поддержки";
    fieldContainer.appendChild(titleField);

    // Create the phone input element
    const phoneInput = document.createElement('input');
    phoneInput.classList.add("widget_settings_block__controls__", "text-input");
    fieldContainer.appendChild(phoneInput);

    // Create the error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add("widget_settings_block__error", "widget_settings_block__errorphone");
    errorMessage.textContent = 'Пожалуйста укажите свой номер телефона для технической поддержки';
    errorMessage.style.display = 'none'; // Initially hide the error message
    fieldContainer.appendChild(errorMessage);

    // Append the field container to the mount point
    mountPoint.appendChild(fieldContainer);

    const saveButton = document.querySelector('.js-widget-save');
    saveButton.setAttribute("disabled", "");

    let phone = null;
    phoneInput.addEventListener("input", (event) => {
        phone = fixPhoneNumber(event.target.value);
        const isValidPhoneNumber = validatePhoneNumber(phone);
        if (isValidPhoneNumber) {
            saveButton.removeAttribute("disabled");
            errorMessage.style.display = 'none'; // Hide error message if valid
        } else {
            saveButton.setAttribute("disabled", "");
            errorMessage.style.display = 'block'; // Show error message if invalid
        }
    });

    saveButton.addEventListener("click", async () => {
        await sendNumber({
            phone,
            subdomain: APP.constant('account').subdomain,
            amoId: APP.constant('account').id,
            users: Object.values(APP.constant('account').users).length,
            paymentTill: APP.constant('account').paid_till,
            tariff: APP.constant('account').tariffName

        }, url);
    });

    applyPhoneMask(phoneInput);
};