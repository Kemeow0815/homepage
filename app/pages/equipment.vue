<script setup lang="ts">
import equipmentData from '~/data/equipment.json'
import type { EquipmentItem } from '~/types/equipment'

useHead({
  title: '我的装备',
})

definePageMeta({
  headerText: '我的装备',
})

// 类型转换
const data = equipmentData as { categories: { key: string; label: string; icon: string; color: string }[]; items: EquipmentItem[] }

// 当前激活的分类
const activeCategory = ref('硬件')

// 计算属性过滤设备
const filteredEquipment = computed(() =>
  data.items.filter(item => item.category === activeCategory.value)
)

// 获取分类数量
const getCategoryCount = computed(() => (category: string) => {
  return data.items.filter(item => item.category === category).length
})

// 切换分类
function handleTabClick(category: string) {
  activeCategory.value = category
}
</script>

<template>
  <div class="equipment-page">
    <div class="equipment-container">
      <!-- 顶部导航栏 -->
      <div class="categories-tabs">
        <div class="tabs-container">
          <div
            v-for="category in data.categories"
            :key="category.key"
            class="category-tab"
            :class="{ active: activeCategory === category.key }"
            @click="handleTabClick(category.key)"
            :style="{ '--tab-color': category.color }"
          >
            <Icon :name="category.icon === 'Laptop' ? 'ri:computer-line' : 'ri:box-3-line'" />
            <span>{{ category.label }}</span>
            <span class="count">{{ getCategoryCount(category.key) }}</span>
          </div>
        </div>
      </div>

      <!-- 设备展示区 -->
      <div class="equipment-list">
        <div
          v-for="(item, index) in filteredEquipment"
          :key="item.name + index"
          class="equipment-card"
        >
          <div class="equipment-image">
            <img
              :src="item.image"
              :alt="item.name"
              loading="lazy"
            >
          </div>
          <div class="equipment-content">
            <div class="equipment-header">
              <h3 class="card-name">
                {{ item.name }}
              </h3>
              <div
                class="card-category"
                :style="{ '--category-color': item.category === '硬件' ? '#3b82f6' : '#10b981' }"
              >
                {{ item.category }}
              </div>
            </div>
            <div class="equipment-opinion">
              {{ item.desc }}
            </div>
            <div class="card-specs">
              <div
                v-for="([key, value]) in Object.entries(item.info ?? {})"
                :key="key"
                class="spec-item"
              >
                <div class="spec-label">
                  {{ key }}
                </div>
                <div class="spec-value">
                  {{ value }}
                </div>
              </div>
            </div>
            <div class="card-tags">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            <div class="card-footer">
              <div class="purchase-info">
                <Icon name="ri:calendar-line" />
                {{ item.date }}
              </div>
              <div class="price-info">
                ￥{{ item.money }}
              </div>
            </div>
            <div class="equipment-actions">
              <a
                class="equipment-link"
                :href="item.src"
                :title="`跳转到${item.name}的产品详情`"
                target="_blank"
                rel="noopener noreferrer"
              >
                详情
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.equipment-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.equipment-container {
  .categories-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    .tabs-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      padding: 0.5rem;

      .category-tab {
        align-items: center;
        background: transparent;
        border: 2px solid var(--c-border);
        border-radius: 0.6rem;
        color: var(--c-text-2);
        cursor: pointer;
        display: flex;
        font-size: 0.95rem;
        gap: 0.5rem;
        padding: 0.6rem 1.2rem;
        transition: all 0.3s ease;
        white-space: nowrap;

        .count {
          background: var(--c-bg-2);
          border-radius: 0.3rem;
          color: var(--c-text-3);
          font-size: 0.75rem;
          padding: 0.1rem 0.4rem;
        }

        &.active {
          background: color-mix(in srgb, var(--tab-color) 10%, transparent);
          border-color: var(--tab-color);
          color: var(--tab-color);
          font-weight: 600;

          .count {
            background: var(--tab-color);
            color: white;
          }
        }

        &:hover:not(.active) {
          border-color: var(--tab-color);
          color: var(--tab-color);
        }
      }
    }
  }

  .equipment-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 10px 0 0;

    .equipment-card {
      border: 1px solid var(--c-border);
      background: var(--c-bg-1);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px var(--ld-shadow);
      }

      .equipment-image {
        align-items: center;
        display: flex;
        height: 200px;
        justify-content: center;
        position: relative;
        width: 100%;
        background: var(--c-bg-2);
        overflow: hidden;

        img {
          height: 100%;
          object-fit: contain;
          width: 100%;
          padding: 0.8rem;
          transition: transform 0.3s;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }

      .equipment-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;

        .equipment-header {
          align-items: flex-start;
          gap: 0.8rem;
          display: flex;
          justify-content: space-between;

          .card-name {
            color: var(--c-text-1);
            font-size: 1.1rem;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .card-category {
            background: color-mix(in srgb, var(--category-color) 10%, transparent);
            border-radius: 0.4rem;
            color: var(--category-color);
            flex-shrink: 0;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.3rem 0.8rem;
            white-space: nowrap;
          }
        }

        .equipment-opinion {
          color: var(--c-text-2);
          display: -webkit-box;
          font-size: 0.9rem;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          line-height: 1.4;
          margin: 0;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        .card-specs {
          background: var(--c-bg-2);
          border-radius: 8px;
          display: grid;
          font-size: 0.8rem;
          gap: 0.4rem;
          grid-template-columns: repeat(2, 1fr);
          padding: 0.8rem;

          .spec-item {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;

            .spec-label {
              color: var(--c-text-3);
              font-size: 0.7rem;
              font-weight: 500;
            }

            .spec-value {
              color: var(--c-text-1);
              font-size: 0.8rem;
              word-break: break-word;
            }
          }
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;

          .tag {
            background: var(--c-primary-soft);
            border-radius: 0.3rem;
            color: var(--c-primary);
            display: inline-block;
            font-size: 0.7rem;
            padding: 0.15rem 0.5rem;
            white-space: nowrap;
          }
        }

        .card-footer {
          border-top: 1px solid var(--c-border);
          color: var(--c-text-2);
          display: flex;
          flex-wrap: wrap;
          font-size: 0.75rem;
          gap: 0.8rem;
          padding-top: 0.6rem;
          align-items: center;
          justify-content: space-between;

          .purchase-info {
            display: flex;
            align-items: center;
            gap: 0.3rem;
          }

          .price-info {
            color: var(--c-primary);
            font-weight: 600;
            font-size: 0.9rem;
          }
        }

        .equipment-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          .equipment-link {
            font-size: 0.8rem;
            background: var(--c-bg-2);
            color: var(--c-text-1);
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.3s ease;
            border: 1px solid var(--c-border);

            &:hover {
              color: var(--c-bg);
              background: var(--c-primary);
              border-color: var(--c-primary);
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .equipment-page {
    padding: 10px;
  }

  .equipment-container {
    .equipment-list {
      grid-template-columns: 1fr;
      gap: 12px;

      .equipment-card {
        .equipment-image {
          height: 180px;
        }
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .equipment-container {
    .categories-tabs {
      .tabs-container {
        .category-tab {
          padding: 0.5rem 0.8rem;
          font-size: 0.85rem;
        }
      }
    }

    .equipment-list {
      .equipment-card {
        .equipment-content {
          padding: 0.8rem;

          .card-specs {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }
}
</style>
