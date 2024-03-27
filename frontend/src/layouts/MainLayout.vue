<script lang="ts" setup>
// import { Loader2 } from 'lucide-vue-next'

defineSlots<{
  default: () => any
  sidebarHeader: () => any
  sidebarNav: () => any
  mainNavigation: () => any
  aside: () => any
}>()
</script>

<template>
  <div class="main-layout text-slate-200">
    <SideNav class="nav bg-background2" />

    <div class="sidebar bg-background2/20">
      <div class="sidebar__header">
        <slot name="sidebarHeader"> </slot>
      </div>
      <nav class="sidebar__nav">
        <!-- <Suspense> -->
        <slot name="sidebarNav"> </slot>

        <!-- <template #fallback>
            <div class="flex flex-col gap-4 py-4 px-4">
              <UserSkeleton v-for="i in 10" :key="i" />
            </div>
          </template>
        </Suspense> -->
      </nav>
      <section class="sidebar__profile">
        <ProfileCard />
      </section>
    </div>

    <main class="main bg-background">
      <section class="main__navigation" role="navigation">
        <slot name="mainNavigation"> </slot>
      </section>
      <div class="main__content">
        <!-- <Suspense> -->
        <slot> </slot>

        <!-- <template #fallback>
            <div class="flex items-center justify-center w-full h-full">
              <Loader3D />
            </div>
          </template>
        </Suspense> -->

        <aside class="main__aside">
          <!-- <Suspense> -->
          <slot name="aside"> </slot>

          <!-- <template #fallback>
              <div class="flex items-center justify-center w-full h-full">
                <Loader2 class="animate-spin" />
              </div>
            </template>
          </Suspense> -->
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  @apply w-full h-full bg-background text-gray-400 text-lg font-medium;
  display: grid;
  grid-template-columns: auto auto 1fr;

  .nav {
    width: 72px;
  }

  .sidebar {
    display: grid;
    grid-template-rows: auto 1fr auto;
    width: 260px;

    .sidebar__header {
      height: 48px;
      box-shadow: 0 1px 1px 0px hsl(var(--background-2) / 0.8);
    }

    .sidebar__nav {
      height: calc(100vh - 48px - 53px);
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar-thumb {
        background-color: transparent;
      }

      &:hover {
        &::-webkit-scrollbar-thumb {
          background-color: #4e515b;
        }
      }
    }

    .sidebar__profile {
      height: 53px;
      background-color: #232428;
    }
  }

  .main {
    display: grid;
    grid-template-rows: auto 1fr;

    .main__navigation {
      height: 48px;
      box-shadow: 0 1px 1px 0px hsl(var(--background-2) / 0.8);
    }

    .main__content {
      display: grid;
      grid-template-columns: 7fr auto;
      height: calc(100vh - 48px);

      .main__aside {
        width: 340px;
        margin-left: auto;
        border-left: 1px solid hsl(var(--border) / 0.6);
        overflow-y: auto;
        overflow-x: hidden;

        &::-webkit-scrollbar-thumb {
          background-color: transparent;
        }

        &:hover {
          &::-webkit-scrollbar-thumb {
            background-color: #4e515b;
          }
        }
      }
    }
  }
}
</style>
