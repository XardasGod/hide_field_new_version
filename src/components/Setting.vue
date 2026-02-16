<template>
    <div class="settingCard">
        <button class="delete_button" @click="$emit('delete')">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="16"
                height="16" viewBox="0 0 256 256" xml:space="preserve">

                <defs>
                </defs>
                <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;"
                    transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                    <path
                        d="M 68.842 90 H 21.158 c -4.251 0 -7.696 -3.446 -7.696 -7.696 v -52.09 h 63.077 v 52.09 C 76.538 86.554 73.092 90 68.842 90 z"
                        style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(188,60,60); fill-rule: nonzero; opacity: 1;"
                        transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path
                        d="M 78.321 22.213 H 11.679 c -2.209 0 -4 -1.791 -4 -4 s 1.791 -4 4 -4 h 66.643 c 2.209 0 4 1.791 4 4 S 80.53 22.213 78.321 22.213 z"
                        style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(188,60,60); fill-rule: nonzero; opacity: 1;"
                        transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path
                        d="M 57.815 22.213 h -25.63 c -2.209 0 -4 -1.791 -4 -4 V 7.696 C 28.185 3.453 31.637 0 35.881 0 h 18.238 c 4.244 0 7.696 3.453 7.696 7.696 v 10.517 C 61.815 20.422 60.024 22.213 57.815 22.213 z M 36.185 14.213 h 17.63 V 8 h -17.63 V 14.213 z"
                        style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(188,60,60); fill-rule: nonzero; opacity: 1;"
                        transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path
                        d="M 54.784 78.235 c -2.209 0 -4 -1.791 -4 -4 V 44.976 c 0 -2.209 1.791 -4 4 -4 s 4 1.791 4 4 v 29.259 C 58.784 76.444 56.993 78.235 54.784 78.235 z"
                        style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;"
                        transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path
                        d="M 35.216 78.235 c -2.209 0 -4 -1.791 -4 -4 V 44.976 c 0 -2.209 1.791 -4 4 -4 s 4 1.791 4 4 v 29.259 C 39.216 76.444 37.425 78.235 35.216 78.235 z"
                        style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;"
                        transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                </g>
            </svg>
        </button>
        <div class="dropdown">
            <input type="text" placeholder="Выберите поле" @focus="showDropdown = true" :value="nameBuffer"
                @input="filterOptions">
            <div v-if="showDropdown" ref="dropdownList" class="dropdown-content">
                <div v-for="field in filteredCustomFieldsOptions" @click="selectOption(field)" :key="field">
                    {{ field }}
                </div>
            </div>
        </div>
        <div v-if="fieldConfig.name" style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
            <p>Выберите воронку в которой хотите скрыть поля:</p>
            <a-select  class="select_width" v-model:value="fieldConfig.pipelines" :options="pipelineOptions" optionFilterProp="label" mode="multiple"
                        showSearch></a-select>

             <p>Выберите менеджеро для которых хотите скрыть поля:</p>
             <a-select class="select_width" v-model:value="fieldConfig.managers" :options="userOptions" mode="multiple"
                    optionFilterProp="label" showSearch>
                    <template #option="{ label, avatar }">
                        <a-avatar :src="avatar" :size="20" style="margin-right: 5px" />
                        {{ label }}
                    </template>
                </a-select>

        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    data() {
        return {
            isBold: false,
            color: null,
            nameBuffer: "", //Переменная для поиска полей
            fieldConfig: {
                pipelines: [],
                managers: [],
                name: "",
            },
            pipelineOptions: [],
            userOptions: (() => {
                const managers = AMOCRM.constant('managers')
                const managersArray = Object.values(managers)
                return managersArray
                    .filter(manager => manager.active === true) // Фильтруем активных пользователей
                    .map(manager => ({
                        label: manager.title,
                        avatar: manager.avatar,
                        value: Number(manager.id),
                    }));
            })(),

            showDropdown: false,
            customFields: (() => {
                const customFields = APP.constant('account').cf;
                const customFieldsArray = Object.values(customFields);
                return customFieldsArray.map(field => field.NAME);
            })(),
            filteredCustomFieldsOptions: []
        };
    },
    props: {
        input: null,
        selectedFields: []
    },
    watch: {
        isBold: {
            handler() {
                this.updateStyle();
            },
        },
        color: {
            handler() {
                this.updateStyle();
            },
        },
        fieldConfig: {
            handler() {
                this.$emit('output', this.fieldConfig);
            },
            deep: true
        }
    },
    async created() {
        this.filteredCustomFieldsOptions = this.customFields;
        if (this.input.hasOwnProperty('name')) {
            delete this.input.id;
            this.fieldConfig = this.input;
            this.nameBuffer = this.input.name;
        }
        try { //получение воронок и этапов
            const response = await fetch(window.location.origin + '/api/v4/leads/pipelines');
            const jsonResponse = await response.json();
            this.pipelineOptions = jsonResponse._embedded.pipelines.map(pipeline => ({ //получаем и форматируем поля в удобном виде для a-select
                label: pipeline.name,
                value: Number(pipeline.id)
            }));
        } catch (error) {
        }
    },
    methods: {
        filterOptions($event) {
            this.nameBuffer = $event.target.value;
            const value = $event.target.value.toLowerCase();
            this.filteredCustomFieldsOptions = this.customFields
                .filter(manager => manager.toLowerCase().includes(value))
                .filter(field => !this.selectedFields.includes(field)); // Фильтруем уже выбранные поля
        },
        selectOption(option) {
            this.fieldConfig.name = option;
            this.nameBuffer = option;
            this.showDropdown = false;
        },
    }
});
</script>
<style scoped>
.dropdown {
    position: relative;
    display: inline-block;
    width: 100%;
}

.dropdown input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border: 1px solid rgb(228, 231, 236);

}

.dropdown-content {
    position: absolute;
    z-index: 999;
    background-color: #f9f9f9;
    min-width: 100%;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    max-height: 200px;
    overflow-y: auto;
}

.dropdown-content div {
    padding: 8px 16px;
    cursor: pointer;
}

.dropdown-content div:hover {
    background-color: #f1f1f1;
}

.checkbox_container {
    display: flex;
    gap: 12px;
}

.settingCard {
    border: 1px solid rgb(228, 231, 236);
    border-radius: 8px;
    padding: 8px;
    position: relative;
}

.delete_button {
    z-index: 100;
    position: absolute;
    right: 8px;
    bottom: 0.1rem;
    border: none;
    background: transparent;
}
.select_width {
    width: 90%;
}
</style>