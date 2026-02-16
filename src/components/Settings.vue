<template>
    <div class="settings_container">
        <span v-if="accessInfo" class="accessInfo">{{ accessInfo.status === 'active' ? `Оплаченный период:
            ${accessInfo.days} дней` :
            `Тестовый период: ${accessInfo.days} дней` }}</span>
        <a href="https://widgetsfree.crm82.ru/hide_fields_tutorial.pdf" target="_blank"
        style="font-weight: 600;">Инструкция</a>
            <template v-if="is_admin">
        <Setting v-for="(setting, index) in settings" :input="settings[index]" :selectedFields="getSelectedFields()"
            @output="(event) => { settings[index] = { ...JSON.parse(JSON.stringify(event)), id: settings[index].id }; }"
            @delete="deleteSetting(index)" :key="setting.id" />

        <button class="settings_add_button" @click="settings.push({ id: Date.now() })">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
                <rect x="43.75" y="0" width="10" height="100" fill="#5e5e5e" rx="5" />
                <rect x="0" y="43.75" width="100" height="10" fill="#5e5e5e" rx="5" />
            </svg>
        </button>
    </template>

    </div>
</template>

<script>
import { defineComponent, getCurrentInstance } from 'vue'
import { Select, Avatar } from 'ant-design-vue'
import Setting from './Setting.vue';
export default defineComponent({
    setup() {
        const { app } = getCurrentInstance().appContext
        app.use(Select)
        app.use(Avatar)

    },
    components: {
        Setting
    },
    data() {
        return {
            is_admin: APP.constant('user_rights').is_admin,
            accessInfo: null,
            settings: [{ id: Date.now() }],
            configInput: {} //html input кастомного поля настроек amo
        }
    },
    watch: {
        settings: {
            handler() {
                this.updateSettings()
            },
            deep: true
        }
    },
    async created() {
        await this.getData();
        this.filteredCustomFieldsOptions = this.customFields;
        this.configInput = document.querySelector('input[name="fieldsConfig"]');
        if(this.configInput.value){
            const configInputParsed = JSON.parse(this.configInput.value);
            if (Array.isArray(configInputParsed)) {
                this.settings = configInputParsed
            }
            else{
                this.settings = Object.values(configInputParsed)
            }
        }

    },
    methods: {
        async getData() {
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

                if (response.ok) {
                    const data = await response.json()
                    this.accessInfo = data.access_info;
                    localStorage.removeItem("crm82_hide_fields");
                    document.querySelector('#loading_widget').remove();
                } else {
                    // Обработка ошибок
                    if (response.status === 402) {
                        localStorage.setItem('crm82_hide_fields', 'pay_me')
                        document.querySelector('#loading_widget span').innerHTML = `
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600;">Срок действия виджета истек. Свяжитесь с нами для оплаты</span>
                            </div>
                            <br>
                            <span>Стоимость: 1000 руб в месяц</span><br>
                            <span style="display: flex; align-items: center; gap: 0.25rem;">
                                <span>Оплатить: </span>
                                <a href="https://t.me/rudolf_crm" target="_blank" style="display: flex; align-items: center; gap: 0.25rem;">
                                    @rudolf_crm
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 240.1 240.1">
                                        <circle fill="#2AABEE" cx="120.1" cy="120.1" r="120.1" />
                                        <path fill="#FFFFFF" d="M54.3,118.8c35-15.2,58.3-25.3,70-30.2 c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3 c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3 c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8 c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z" />
                                    </svg>
                                </a>
                            </span>
                        `;
                    } else {
                        document.querySelector('#loading_widget').remove();
                    }
                }
            } catch (error) {
            }
        },
        deleteSetting(index) {
            this.settings.splice(index, 1); // Удаляем элемент по индексу
        },
        updateSettings() {
            this.configInput.value = JSON.stringify(this.settings)
            this.configInput.dispatchEvent(new Event('change', { bubbles: true }));
        },
        getSelectedFields() {
            return this.settings.map(setting => setting.name);
        }
    }
})
</script>
<style scoped>
.settings_container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.settings_add_button {
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #00000005;
    border: 1px solid #0505050f;
    border-radius: 8px;
}

.settings_add_button:active {
    background-color: #00000021;
}

.settings_save_button {
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.settings_save_button:hover {
    background-color: #45a049;
}
</style>