<script lang="ts" setup>
import { History } from 'lucide-vue-next'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const { setActiveProfile, fetchGames } = useProfileStore()
const { activeProfile } = storeToRefs(useProfileStore())
const avatarFallback = `https://ui-avatars.com/api/?name=user`

const novice = (level?: number) => level && level < 10
const raider = (level?: number) => level && level >= 10 && level < 30
const legend = (level?: number) => level && level >= 30

function setFallbackAvatar(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = avatarFallback
}

async function _fetchGames($state: any) {
  if (!activeProfile.value) return $state.complete()

  try {
    const res = await fetchGames({
      userId: activeProfile.value.user.id,
      username: activeProfile.value.user.username,
      offset: activeProfile.value.games.length,
      limit: 10
    })
    if (res?.length) $state.loaded()
    else $state.complete()
  } catch (error) {
    $state.error()
  }
}

onMounted(async () => {
  try {
    const username = route.params.username as string
    if (!username) await setActiveProfile()
    else await setActiveProfile(username)
  } catch (error: any) {
    toast.error(error?.message)
    router.go(-1)
  }
})

watch(
  () => route.params.username,
  async (username) => {
    if (!username) await setActiveProfile()
    else await setActiveProfile(username as string)
  }
)
</script>

<template>
  <div class="profile-view">
    <div class="profile-view__banner">
      <AnimatedWaves />
    </div>
    <div class="profile-view__info">
      <div class="left">
        <div class="profile-view__info__avatar">
          <img
            :src="activeProfile?.user?.avatar || ''"
            alt="avatar"
            class="image"
            @error="setFallbackAvatar"
          />
        </div>
        <div class="profile-view__info__fullname">
          <span class="firstname">{{ activeProfile?.user.firstname }}</span>
          <span class="lastname">{{ activeProfile?.user.lastname }}</span>
        </div>
        <div class="profile-view__info__username">
          <span class="username">@{{ activeProfile?.user.username }}</span>
        </div>
        <div class="profile-view__info__bio">
          <span class="profile-view__info__bio__text">{{ activeProfile?.user.bio }}</span>
        </div>

        <div class="profile-view__info__stats">
          <div class="profile-view__info__stats__item">
            <span class="profile-view__info__stats__item__label">Wins: </span>
            <span class="profile-view__info__stats__item__value">
              {{ activeProfile?.user.wins }}
            </span>
          </div>
          <div class="profile-view__info__stats__item">
            <span class="profile-view__info__stats__item__label">Losses: </span>
            <span class="profile-view__info__stats__item__value">
              {{ activeProfile?.user.losses }}
            </span>
          </div>
          <div class="profile-view__info__stats__item">
            <span class="profile-view__info__stats__item__label">Level: </span>
            <span class="profile-view__info__stats__item__value">
              {{ activeProfile?.user.level }}
            </span>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="profile-view__info__achievements">
          <AchievementCard type="novice" v-if="novice(activeProfile?.user.lp)" />
          <AchievementCard type="raider" v-if="raider(activeProfile?.user.lp)" />
          <AchievementCard type="legend" v-if="legend(activeProfile?.user.lp)" />
        </div>
        <div class="profile-view__info__actions">
          <FriendGameSession :user="activeProfile?.user" size="lg" />
          <FriendDM :user="activeProfile?.user" size="lg" />
          <FriendAddRemove :user="activeProfile?.user" :key="activeProfile?.user.id" />
          <Spectate
            v-if="activeProfile?.user?.status == 'INGAME'"
            :user-id="activeProfile?.user?.id"
            :is-game-card="false"
            variant="icon"
            size="lg"
          />
          <MoreActions :user="activeProfile?.user" size="lg" :key="activeProfile?.user.id" />
        </div>
      </div>
    </div>

    <div class="profile-view__games-history">
      <div class="profile-view__games-history__title">
        <History class="stroke-gray-400" />
        <span class="text-gray-400"> Games History </span>
      </div>
      <div class="profile-view__games-history__list">
        <GameCard v-for="game in activeProfile?.games" :key="game.id" :game="game" />
        <div v-if="!activeProfile?.games.length" class="text-gray-400 text-center">
          No games played yet
        </div>

        <InfiniteLoading
          :slots="{ complete: ' ' }"
          @infinite="_fetchGames"
          :identifier="activeProfile?.user?.id"
          :style="{ minHeight: 'auto' }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-view {
  @apply flex flex-col py-8;
  @apply w-full h-full overflow-auto;
  @apply relative;

  &__banner {
    @apply w-full absolute top-0 left-0;
  }

  &__info {
    @apply flex mt-24 px-5 z-10 gap-2;
    @apply w-full;

    &__avatar {
      @apply w-60 h-60 rounded-full border-4 border-background overflow-hidden relative;

      .image {
        @apply w-full h-full rounded-full object-cover;
      }
    }

    &__fullname {
      @apply flex items-center gap-2 text-3xl font-bold mt-4 capitalize;
    }

    &__username {
      @apply text-gray-400 text-base text-slate-400 opacity-50;
    }

    &__bio {
      @apply mt-3;
      @apply text-gray-400 text-base max-w-sm;
    }

    &__stats {
      @apply flex gap-8 mt-2;
      @apply text-gray-400 text-base;

      &__item {
        @apply flex items-center gap-1;

        &__label {
          @apply text-gray-100 text-base font-bold;
        }

        &__value {
          @apply text-gray-200 text-base;
        }
      }
    }

    .right {
      @apply flex flex-col gap-10 mt-20 items-end ml-auto;
    }

    &__actions {
      @apply flex gap-2;

      & > button {
        @apply flex gap-3 px-4 py-2 h-10 rounded-sm text-base font-medium;
        transition: opacity 0.25s ease-in-out;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    &__achievements {
      @apply flex gap-2 ml-auto;
    }
  }

  &__games-history {
    @apply flex flex-col gap-2 mt-6 px-5;

    &__title {
      @apply text-gray-300 text-lg mt-2 font-medium uppercase text-primary relative flex items-center gap-2;

      &:after {
        @apply w-[100%]  h-[1px] bg-gray-400 opacity-50 absolute -bottom-1.5 left-0 rounded-full;
        content: '';
      }
    }

    &__list {
      @apply flex flex-col gap-2 mt-2;
    }
  }
}
</style>
