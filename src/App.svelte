<script lang="ts">
  import { onMount } from "svelte";
  import BottomNavigation from "./components/BottomNavigation.svelte";
  import type { Sale, SellerProfile } from "./domain/models";
  import ProfilePage from "./routes/ProfilePage.svelte";
  import SalesPage from "./routes/SalesPage.svelte";
  import SummaryPage from "./routes/SummaryPage.svelte";
  import InsightsPage from "./routes/InsightsPage.svelte";
  import NotFoundPage from "./routes/NotFoundPage.svelte";

  const profile: SellerProfile = {
    name: "José",
    commissionRate: 0.007,
    monthlyGoal: 50_000,
    workSchedule: {
      weekdays: [1, 2, 3, 4, 5],
      startTime: "09:00",
      endTime: "18:00",
    },
  };

  const sales: Sale[] = [
    {
      id: "mock-1",
      amount: 9_900,
      soldAt: "2026-09-02T14:20:00.000Z",
      createdAt: "2026-09-02T14:20:00.000Z",
    },
    {
      id: "mock-2",
      amount: 13_590,
      soldAt: "2026-09-05T11:00:00.000Z",
      createdAt: "2026-09-05T11:00:00.000Z",
    },
  ];

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

  onMount(() => {
    const syncPageFromHash = () => {
      activePage = pageFromHash(window.location.hash);
    };

    syncPageFromHash();
    window.addEventListener("hashchange", syncPageFromHash);

    return () => window.removeEventListener("hashchange", syncPageFromHash);
  });
</script>

<svelte:head>
  <meta name="description" content="Local-first sales tracking" />
</svelte:head>

<main class="app-shell">
  {#if activePage === "summary"}
    <SummaryPage {profile} {sales} {currency} />
  {:else if activePage === "sales"}
    <SalesPage {sales} {currency} />
  {:else if activePage === "insights"}
    <InsightsPage></InsightsPage>
  {:else if activePage === "profile"}
    <ProfilePage {profile} {currency} />
  {:else}
    <NotFoundPage></NotFoundPage>
  {/if}

  <BottomNavigation {activePage} onSelect={selectPage} />
</main>
