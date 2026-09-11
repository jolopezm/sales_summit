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
  }

  let { activePage, onSelect }: Props = $props();
  let dialog = $state<HTMLDialogElement | undefined>(undefined);

  function openModal() {
    dialog?.showModal();
  }

  function closeModal() {
    dialog?.close();
  }
</script>

<nav class="bottom-navigation" aria-label="Primary navigation">
  <a
    class:active={activePage === "summary"}
    href="#summary"
    onclick={() => onSelect("summary")}
  >
    <Fa icon={faHouse} size="2x"></Fa>
    <p>Home</p>
  </a>
  <a
    class:active={activePage === "sales"}
    href="#sales"
    onclick={() => onSelect("sales")}
  >
    <Fa icon={faList} size="2x"></Fa>
    <p>Ventas</p>
  </a>

  <button class="btn-add-sale" onclick={openModal}>
    <Fa icon={faPlus} size="2x"></Fa>
  </button>

  <a
    class:active={activePage === "insights"}
    href="#insights"
    onclick={() => onSelect("insights")}
  >
    <Fa icon={faChartSimple} size="2x"></Fa>
    <p>Insights</p>
  </a>

  <a
    class:active={activePage === "profile"}
    href="#profile"
    onclick={() => onSelect("profile")}
  >
    <Fa icon={faUser} size="2x"></Fa>
    <p>Perfil</p>
  </a>
</nav>

<dialog bind:this={dialog}>
  <h2>Nueva venta</h2>

  <form action="/add-sale-endpoint" method="post">
    <div>
      <label for="sale-amount"> Ingresa el monto de la venta </label>
      <input type="number" class="ipt-sale-amount" placeholder="0" />
    </div>
  </form>

  <button onclick={closeModal}> Cerrar </button>
  <button class="btn-primary">Guardar</button>
</dialog>
