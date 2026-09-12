<script lang="ts">
  import { onMount } from "svelte";
  import BottomNavigation from "./components/BottomNavigation.svelte";
  import SaleEntryDialog from "./components/SaleEntryDialog.svelte";
  import type { Sale, SellerProfile } from "./domain/models";
  import ProfilePage from "./routes/ProfilePage.svelte";
  import SalesPage from "./routes/SalesPage.svelte";
  import SummaryPage from "./routes/SummaryPage.svelte";
  import InsightsPage from "./routes/InsightsPage.svelte";
  import { DexieSaleRepository } from "./repositories/dexie-sale-repository";
  import { DexieSellerProfileRepository } from "./repositories/dexie-seller-profile-repository";
  import { createSale } from "./services/create-sale";

  const emptyProfile: SellerProfile = {
    name: "",
    commissionRate: 0,
    monthlyCommissionGoal: 0,
    workSchedule: {
      weekdays: [],
      startTime: "",
      endTime: "",
      breakHour: "",
    },
  };

  const saleRepository = new DexieSaleRepository();
  const profileRepository = new DexieSellerProfileRepository();

  let profile = $state<SellerProfile | null>(null);
  let sales = $state<Sale[]>([]);
  let loading = $state(true);
  let loadError = $state("");
  let saleDialogOpen = $state(false);
  let now = $state(new Date());

  const currency = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  type Page = "summary" | "sales" | "profile" | "insights";

  let activePage: Page = $state("summary");

  function pageFromHash(hash: string): Page {
    if (hash === "#sales") return "sales";
    if (hash === "#profile") return "profile";
    if (hash === "#insights") return "insights";
    return "summary";
  }

  function selectPage(page: Page) {
    activePage = page;
  }

  async function addSale(amount: number) {
    const sale = createSale(amount);
    await saleRepository.add(sale);
    sales = [sale, ...sales];
  }

  async function saveProfile(updatedProfile: SellerProfile) {
    await profileRepository.save(updatedProfile);
    profile = updatedProfile;
  }

  async function completeOnboarding(updatedProfile: SellerProfile) {
    await saveProfile(updatedProfile);
    activePage = "summary";
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }

  onMount(() => {
    const syncPageFromHash = () => {
      activePage = pageFromHash(window.location.hash);
    };

    syncPageFromHash();
    window.addEventListener("hashchange", syncPageFromHash);
    const clock = window.setInterval(() => (now = new Date()), 60_000);

    Promise.all([saleRepository.list(), profileRepository.get()])
      .then(([storedSales, storedProfile]) => {
        sales = storedSales;
        if (storedProfile) profile = storedProfile;
      })
      .catch(() => {
        loadError = "No pudimos abrir tus datos locales.";
      })
      .finally(() => {
        loading = false;
      });

    return () => {
      window.removeEventListener("hashchange", syncPageFromHash);
      window.clearInterval(clock);
    };
  });
</script>

<svelte:head>
  <meta name="description" content="Local-first sales tracking" />
</svelte:head>

<main class="app-shell">
  {#if loading}
    <section class="status-page" aria-live="polite">
      <p>Cargando tus datos…</p>
    </section>
  {:else if loadError}
    <section class="status-page" role="alert">
      <h1>No pudimos iniciar la aplicación</h1>
      <p>{loadError}</p>
    </section>
  {:else if profile === null}
    <ProfilePage
      profile={emptyProfile}
      onSave={completeOnboarding}
      onboarding
    />
  {:else}
    {#if activePage === "summary"}
      <SummaryPage {profile} {sales} {currency} {now} />
    {:else if activePage === "sales"}
      <SalesPage {sales} {profile} {currency} {now} />
    {:else if activePage === "insights"}
      <InsightsPage {profile} {sales} {currency} {now} />
    {:else if activePage === "profile"}
      <ProfilePage {profile} onSave={saveProfile} />
    {/if}

    <BottomNavigation
      {activePage}
      onSelect={selectPage}
      onAddSale={() => (saleDialogOpen = true)}
    />
    <SaleEntryDialog
      open={saleDialogOpen}
      onClose={() => (saleDialogOpen = false)}
      onSave={addSale}
    />
  {/if}
</main>
