import { renderPhoneInput } from './phoneMask'
export default class Widget {
    constructor(amoWidget) {
        this.amoWidget = amoWidget
        this.cardObserver = null;

    }
    async customizeFields() {
        let settings = this.amoWidget.get_settings().fieldsConfig
        const paymentStatus = localStorage.getItem('crm82_hide_fields')
        if (APP.getWidgetsArea() === "leads_card" && settings && paymentStatus !== 'pay_me') { //если виджет оплачен предоставляем доступ к функционалу виджета, если нет показываем уведомление об оплате
                if (typeof settings === "string") {//иногда передается нормальный массив иногда строка json, невероятно.
                    settings = Object.values(JSON.parse(this.amoWidget.get_settings().fieldsConfig))
                }
                for (const setting of settings) {
                    this.customize(setting)
                }
            
        }
        await this.checkPayment(); //в любом случае проверяем оплату
    }
    async customize(setting) {
        const pipeline_id = await this.getPipelineId();
        if (setting.pipelines.indexOf(pipeline_id) != -1 && setting.managers.indexOf(APP.constant('user').id) != -1) {
            const fields = document.querySelectorAll(`.linked-form__field__label[title="${setting.name}"]`);
            for (const field of fields) {
                field.style.display = 'none'

            }
        }
    }


    // Функция, которая выполняет запрос с использованием fetch и async/await
    async getPipelineId() {
        // Получение ID текущей сделки
        const dealId = window.location.pathname.split('/').pop();
        try {
            const response = await fetch(`/api/v4/leads/${dealId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const pipelineId = data.pipeline_id;

            return pipelineId;
        } catch (error) {
            console.error('Ошибка при получении данных о воронке:', error);
        }
    }

    async checkPayment() {
        try {
            const response = await fetch('https://widgetsfree.crm82.ru/api/widget/hide_fields/access_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subdomain: APP.constant('account').subdomain
                })
            });
            if (response.status === 200) {
                localStorage.removeItem("crm82_hide_fields");
            }
            else if (response.status === 402) {
                localStorage.setItem('crm82_hide_fields', 'pay_me')
                const error_params = {
                    header: "Скрытие полей CRM82",
                    text: "Срок действия виджета истек. Перейдите в настройки для оплаты"
                };
                AMOCRM.notifications.show_message_error(error_params);
            }
        } catch (error) {
            console.error(error); // Log any other errors
        }
    }

    async mountSettings() { //настройки виджета
        const LoadingDiv = document.createElement('div');
        LoadingDiv.innerHTML = '<div style="position:absolute; left:0; right:0; top:0; bottom:0; display:flex; justify-content:center; align-items:center; background-color:white; z-index: 999"><span>Загрузка...</span></div>'
        LoadingDiv.id = 'loading_widget'
        //загрузка
        const sеttingsDescription = document.querySelector('.widget_settings_block__descr'); //точка монтирования
        //  const description = document.createElement('div');

        sеttingsDescription.innerHTML = ""; //удаление дефолтного описания
        sеttingsDescription.parentElement.appendChild(LoadingDiv); //установка загрузки


        this.vueApp = await this.createApp(() => import('./components/Settings.vue'))
        this.vueApp.mount(sеttingsDescription);

        try {
            const response = await fetch(`https://widgetsfree.crm82.ru/api/widget/hide_fields/access_info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subdomain: APP.constant('account').subdomain
                })
            });
            if (response.status === 401) {
                sеttingsDescription.removeChild(sеttingsDescription.lastChild); //удаление настроек виджета и рендер формы ввода телефона
                renderPhoneInput(sеttingsDescription, 'https://widgetsfree.crm82.ru/api/widget/hide_fields/phone');
            }
        } catch (error) {
        }

    }

    async createApp(component, props) {
        const { createApp, defineAsyncComponent } = await import('vue')
        return createApp(defineAsyncComponent(component), props)
    }

    addCardObserver() {
        this.cardObserver && this.cardObserver.disconnect()

        this.cardObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.id === 'card_fields') {
                        this.customizeFields()
                    }
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('button-input__saved')) {
                        this.customizeFields()
                    }

                });
            });
        });
        const target = document.querySelector('#card_holder')
        this.cardObserver.observe(target, { childList: true, subtree: true });
    }

    forRenderFunction() { //обсервер не всегда ставится через init по каким то причинам.
        if (!this.cardObserver) {
            this.customizeFields()
            this.addCardObserver()
        }
    }

}