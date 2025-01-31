import { type Repl, type ReplProps, type ReplStore } from "@vue/repl";
import {
  type VNode,
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  shallowRef,
} from "vue";
import { LoadingIcon } from "vuepress-shared/client";

import { CODE_SVG } from "./icons.js";
import { getVuePlaygroundSettings } from "../utils/playground.js";

import "@vue/repl/style.css";
import "../styles/vue-playground.scss";

export default defineComponent({
  name: "VuePlayground",

  props: {
    /**
     * Playground title
     *
     * 演示标题
     */
    title: {
      type: String,
      default: "",
    },

    /**
     * Playground file data
     *
     * 演示文件数据
     */
    files: { type: String, required: true },

    /**
     * Playground settings
     *
     * 演示设置
     */
    settings: { type: String, default: "{}" },
  },

  setup(props) {
    const loading = ref(true);
    const component = shallowRef<typeof Repl>();
    const store = ref<ReplStore>();

    const playgroundOptions = computed(() =>
      getVuePlaygroundSettings(props.settings)
    );

    // eslint-disable-next-line vue/no-ref-object-destructure
    const showCode = ref(playgroundOptions.value.showCode || false);

    const setupRepl = async (): Promise<void> => {
      const { ReplStore, Repl } = await import(
        /* webpackChunkName: "vue-repl" */ "@vue/repl"
      );

      component.value = Repl;
      store.value = new ReplStore({
        serializedState: decodeURIComponent(props.files),
        showOutput: true,
      });

      if (playgroundOptions.value.vueVersion)
        await store.value.setVueVersion(playgroundOptions.value.vueVersion);
    };

    onMounted(async () => {
      await setupRepl();
      loading.value = false;
    });

    return (): (VNode | null)[] => [
      h("div", { class: "vue-playground-wrapper" }, [
        h("div", { class: "title-wrapper" }, [
          props.title
            ? h("div", { class: "title" }, decodeURIComponent(props.title))
            : null,
          h("div", { class: "actions" }, [
            h("button", {
              class: "action",
              innerHTML: CODE_SVG,
              onClick: () => {
                showCode.value = !showCode.value;
              },
            }),
          ]),
        ]),
        h(
          "div",
          {
            class: [
              "repl-container",
              showCode.value ? "show-code" : "hide-code",
            ],
          },
          [
            loading.value
              ? h(LoadingIcon, { class: "preview-loading", height: 192 })
              : null,
            component.value
              ? h(component.value, <ReplProps>{
                  store: store.value,
                  ...playgroundOptions.value,
                })
              : null,
          ]
        ),
      ]),
    ];
  },
});
