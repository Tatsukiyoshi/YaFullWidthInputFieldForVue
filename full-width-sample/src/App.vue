<template>
  <FullWidthNumberField
    label="価格"
    :value="price"
    @update:value="price = $event"
    :min="0"
    :max="1000000"
    required
    name="price"
    placeholder="全角で価格を入力"
    helper-text="0から1,000,000の範囲"
    :allow-decimal="true"
  />
  <FullWidthNumberField
    label="数量"
    :value="quantity"
    @update:value="quantity = $event"
    :min="1"
    required
    name="quantity"
    placeholder="数量を入力"
    helper-text="1以上の整数を入力"
    :allow-decimal="false"
  />
</template>

<script setup>
import { ref } from 'vue';
import FullWidthNumberField from './components/FullWidthNumberField.vue';

const price = ref('');
const quantity = ref('');
</script>
