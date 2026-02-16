import Widget from './widget';
export default function (amoWidget) {
  let widget;
  const getWidget = async () => {
    if (process.env.NODE_ENV === 'production') {
      __webpack_public_path__ = `${amoWidget.params.path}/build/`
    }
    if (!widget) {
      widget = new Widget(amoWidget)
    }

    return widget
  }
  amoWidget.callbacks = {
    settings: async function () {
      ; (await getWidget()).mountSettings();
    },
    init: async function () {
      ; (await getWidget()).addCardObserver();
      return true;
    },
    bind_actions: function () {
      return true;
    },
    render: async function () {
      ;(await getWidget()).forRenderFunction();
      return true;
    },
    dpSettings: function () { },
    advancedSettings: function () { },
    destroy: function () { },
    contacts: {
      selected: function () { }
    },
    onSalesbotDesignerSave: function (handler_code, params) { },
    leads: {
      selected: function () { }
    },
    todo: {
      selected: function () { }
    },
    onSave: function () { return true; },
    onAddAsSource: function (pipeline_id) { }
  };
  return amoWidget
}
