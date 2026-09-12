<script lang="ts">
  import Fa from "svelte-fa";
  import {
    faHouse,
    faChartSimple,
    faPlus,
    faUser,
    faList,
  } from "@fortawesome/free-solid-svg-icons";

  type Page = "summary" | "sales" | "profile" | "insights";

  interface Props {
    activePage: Page;
    onSelect: (page: Page) => void;
    onAddSale: () => void;
  }

  let { activePage, onSelect, onAddSale }: Props = $props();
</script>

<nav class="bottom-navigation" aria-label="Navegación principal">
  <a
    class:active={activePage === "summary"}
    href="#summary"
    onclick={() => onSelect("summary")}
    aria-current={activePage === "summary" ? "page" : undefined}
  >
    <Fa icon={faHouse} size="2x"></Fa>
    <span>Inicio</span>
  </a>
  <a
    class:active={activePage === "sales"}
    href="#sales"
    onclick={() => onSelect("sales")}
    aria-current={activePage === "sales" ? "page" : undefined}
  >
    <Fa icon={faList} size="2x"></Fa>
    <span>Ventas</span>
  </a>

  <button class="btn-add-sale" onclick={onAddSale} aria-label="Registrar una venta">
    <Fa icon={faPlus} size="2x"></Fa>
  </button>

  <a
    class:active={activePage === "insights"}
    href="#insights"
    onclick={() => onSelect("insights")}
    aria-current={activePage === "insights" ? "page" : undefined}
  >
    <Fa icon={faChartSimple} size="2x"></Fa>
    <span>Insights</span>
  </a>

  <a
    class:active={activePage === "profile"}
    href="#profile"
    onclick={() => onSelect("profile")}
    aria-current={activePage === "profile" ? "page" : undefined}
  >
    <Fa icon={faUser} size="2x"></Fa>
    <span>Perfil</span>
  </a>
</nav>
