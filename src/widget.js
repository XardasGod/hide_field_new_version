import { renderPhoneInput } from './phoneMask'

const STAGE_DEBOUNCE_MS = 150

export default class Widget {
    constructor(amoWidget) {
        this.amoWidget = amoWidget
        this.cardObserver = null
        this.stageObserver = null
        this.recalcTimer = null
        this.managedFieldTitles = new Set()
    }

    parseSettings() {
        let settings = this.amoWidget.get_settings().fieldsConfig
        if (!settings) {
            return []
        }

        if (typeof settings === 'string') {
            try {
                const parsed = JSON.parse(settings)
                settings = Array.isArray(parsed) ? parsed : Object.values(parsed)
            } catch (error) {
                console.error('Ошибка парсинга настроек hide_fields:', error)
                return []
            }
        }

        if (!Array.isArray(settings)) {
            settings = Object.values(settings)
        }

        return settings
            .filter(setting => setting && setting.name)
            .map(setting => ({
                ...setting,
                pipelines: Array.isArray(setting.pipelines) ? setting.pipelines.map(Number) : [],
                managers: Array.isArray(setting.managers) ? setting.managers.map(Number) : [],
                stagesByPipeline: setting.stagesByPipeline && typeof setting.stagesByPipeline === 'object'
                    ? Object.fromEntries(Object.entries(setting.stagesByPipeline).map(([pipelineId, statuses]) => [
                        Number(pipelineId),
                        Array.isArray(statuses) ? statuses.map(Number) : []
                    ]))
                    : {}
            }))
    }

    getCurrentLeadContextFromDOM() {
        const readNumericValue = selector => {
            const node = document.querySelector(selector)
            if (!node) {
                return null
            }

            const raw = node.value ?? node.getAttribute('value') ?? node.dataset.value
            const parsed = Number(raw)
            return Number.isFinite(parsed) ? parsed : null
        }

        let statusId = readNumericValue('input[name="STATUS"]')
            ?? readNumericValue('input[name="status_id"]')
            ?? readNumericValue('input[name="lead[STATUS]"]')
            ?? readNumericValue('[name="STATUS_ID"]')

        if (statusId === null) {
            const selectedOption = document.querySelector(
                '[data-field-code="STATUS"] [data-id], [data-field-code="STATUS"] [data-value], .control--select--list--item.selected'
            )

            if (selectedOption) {
                const raw = selectedOption.dataset.id ?? selectedOption.dataset.value ?? selectedOption.getAttribute('data-id')
                const parsed = Number(raw)
                statusId = Number.isFinite(parsed) ? parsed : null
            }
        }

        let pipelineId = readNumericValue('input[name="PIPELINE_ID"]')
            ?? readNumericValue('input[name="pipeline_id"]')
            ?? readNumericValue('input[name="lead[PIPELINE_ID]"]')

        if (pipelineId === null) {
            const statusField = document.querySelector('[data-field-code="STATUS"]')
            if (statusField) {
                const raw = statusField.dataset.pipelineId ?? statusField.getAttribute('data-pipeline-id')
                const parsed = Number(raw)
                pipelineId = Number.isFinite(parsed) ? parsed : null
            }
        }

        if (pipelineId === null || statusId === null) {
            return null
        }

        return { pipelineId, statusId }
    }

    resetAllManagedFields() {
        this.managedFieldTitles.forEach(fieldName => {
            const fields = document.querySelectorAll(`.linked-form__field__label[title="${fieldName}"]`)
            fields.forEach(field => {
                field.style.display = ''
            })
        })
    }

    shouldHideField(setting, context) {
        const userId = Number(APP.constant('user').id)

        if (!setting.managers.includes(userId)) {
            return false
        }

        if (!setting.pipelines.includes(context.pipelineId)) {
            return false
        }

        const statusesForPipeline = setting.stagesByPipeline[context.pipelineId]

        if (!Array.isArray(statusesForPipeline) || statusesForPipeline.length === 0) {
            return true
        }

        return statusesForPipeline.includes(context.statusId)
    }

    hideMatchedFields(settings, context) {
        settings.forEach(setting => {
            if (!this.shouldHideField(setting, context)) {
                return
            }

            const fields = document.querySelectorAll(`.linked-form__field__label[title="${setting.name}"]`)
            fields.forEach(field => {
                field.style.display = 'none'
            })
        })
    }

    async customizeFields() {
        const paymentStatus = localStorage.getItem('crm82_hide_fields')

        if (APP.getWidgetsArea() === 'leads_card' && paymentStatus !== 'pay_me') {
            const settings = this.parseSettings()
            this.managedFieldTitles = new Set(settings.map(setting => setting.name))

            this.resetAllManagedFields()

            const context = this.getCurrentLeadContextFromDOM()
            if (context) {
                this.hideMatchedFields(settings, context)
            }
        }

        await this.checkPayment()
    }

    scheduleRecalculate() {
        clearTimeout(this.recalcTimer)
        this.recalcTimer = setTimeout(() => {
            this.customizeFields()
        }, STAGE_DEBOUNCE_MS)
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
            })
            if (response.status === 200) {
                localStorage.removeItem('crm82_hide_fields')
            }
            else if (response.status === 402) {
                localStorage.setItem('crm82_hide_fields', 'pay_me')
                const error_params = {
                    header: 'Скрытие полей CRM82',
                    text: 'Срок действия виджета истек. Перейдите в настройки для оплаты'
                }
                AMOCRM.notifications.show_message_error(error_params)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async mountSettings() {
        const LoadingDiv = document.createElement('div')
        LoadingDiv.innerHTML = '<div style="position:absolute; left:0; right:0; top:0; bottom:0; display:flex; justify-content:center; align-items:center; background-color:white; z-index: 999"><span>Загрузка...</span></div>'
        LoadingDiv.id = 'loading_widget'
        const sеttingsDescription = document.querySelector('.widget_settings_block__descr')

        sеttingsDescription.innerHTML = ''
        sеttingsDescription.parentElement.appendChild(LoadingDiv)

        this.vueApp = await this.createApp(() => import('./components/Settings.vue'))
        this.vueApp.mount(sеttingsDescription)

        try {
            const response = await fetch('https://widgetsfree.crm82.ru/api/widget/hide_fields/access_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subdomain: APP.constant('account').subdomain
                })
            })
            if (response.status === 401) {
                sеttingsDescription.removeChild(sеttingsDescription.lastChild)
                renderPhoneInput(sеttingsDescription, 'https://widgetsfree.crm82.ru/api/widget/hide_fields/phone')
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
                        this.scheduleRecalculate()
                    }
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('button-input__saved')) {
                        this.scheduleRecalculate()
                    }
                })
            })
        })
        const target = document.querySelector('#card_holder')
        if (target) {
            this.cardObserver.observe(target, { childList: true, subtree: true })
        }

        this.addStageObserver()
    }

    addStageObserver() {
        this.stageObserver && this.stageObserver.disconnect()

        const target = document.querySelector('#card_holder')
        if (!target) {
            return
        }

        this.stageObserver = new MutationObserver(() => {
            this.scheduleRecalculate()
        })

        this.stageObserver.observe(target, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['class', 'value', 'data-id', 'data-value', 'data-pipeline-id']
        })
    }

    forRenderFunction() {
        if (!this.cardObserver) {
            this.customizeFields()
            this.addCardObserver()
        }
    }
}
