<!-- filepath: src/components/FullWidthNumberField.vue -->
<template>
  <v-text-field
    :label="props.label"
    :placeholder="props.placeholder"
    :model-value="displayValue"
    @update:model-value="handleInternalChange"
    @blur="handleInternalBlur"
    type="text"
    :error-messages="internalHelperText"
    :helper-text="props.externalHelperText || defaultHelperText"
    @compositionstart="isComposing = true"
    @compositionend="handleCompositionEnd"
    v-bind="$attrs"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// 入力値を正規化する関数 (全角→半角、カンマ除去)
const normalizeAndRemoveCommas = (input) => {
  if (input === undefined || input === null) return '';
  let str = String(input);
  // 全角数字を半角に変換
  str = str.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  );
  // 全角ピリオドを半角ピリオドに変換
  str = str.replace(/．/g, '.');
  // カンマを除去
  str = str.replace(/,/g, '');
  return str;
};

// 数値をカンマ区切り文字列にフォーマットする関数
const formatNumberWithCommas = (value, allowDecimal, decimalPlaces) => {
  if (value === null || value === undefined) return '';
  const valStr = String(value);

  if (valStr === '' || valStr === '-' || valStr === '.' || valStr === '-.') return valStr;

  const num = Number(valStr);

  if (isNaN(num)) {
    const parts = valStr.split('.');
    const integerPart = parts[0];
    const potentialDecimalPart = parts.length > 1 ? parts[1] : undefined;
    const intNumCheck = Number(integerPart);
    if (integerPart !== '' && !isNaN(intNumCheck)) {
      let formattedInt = Number(integerPart).toLocaleString('en-US', { maximumFractionDigits: 0 });
      if (allowDecimal && potentialDecimalPart !== undefined) {
        return `${formattedInt}.${potentialDecimalPart}`;
      }
      return formattedInt;
    }
    return valStr;
  }

  const options = {};
  if (!allowDecimal) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  } else {
    if (decimalPlaces !== undefined) {
      options.minimumFractionDigits = decimalPlaces;
      options.maximumFractionDigits = decimalPlaces;
    } else {
      const decimalPartStr = valStr.split('.')[1];
      if (decimalPartStr) {
        options.minimumFractionDigits = decimalPartStr.length;
        options.maximumFractionDigits = decimalPartStr.length;
      } else {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
      }
    }
  }
  return num.toLocaleString('en-US', options);
};

// --- Props and Emits ---
const props = defineProps({
  label: {
    type: String,
    default: '数値',
  },
  placeholder: {
    type: String,
    default: '全角数字も入力できます',
  },
  value: { // for v-model:value
    type: [String, Number, null],
    default: null,
  },
  min: {
    type: Number,
    default: null,
  },
  max: {
    type: Number,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  allowDecimal: {
    type: Boolean,
    default: true,
  },
  decimalPlaces: {
    type: Number,
    default: null,
  },
  externalHelperText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:value']);

// --- Reactive State ---
const internalValue = ref(normalizeAndRemoveCommas(props.value));
const internalHelperText = ref('');
const isComposing = ref(false);

// --- Computed Properties ---
const error = computed(() => !!internalHelperText.value);

const displayValue = computed(() => {
  // IME入力中、またはエラーがある場合はフォーマットせずにそのまま表示
  return (isComposing.value || error.value)
    ? internalValue.value
    : formatNumberWithCommas(internalValue.value, props.allowDecimal, props.decimalPlaces);
});

const defaultHelperText = computed(() => {
  return props.allowDecimal ? '全角数字も半角に変換されます。' : '全角整数も半角に変換されます。';
});

// --- Logic and Handlers ---
const validateAndSetError = (currentValue) => {
  let currentHelperText = '';

  if (props.required && currentValue === '') {
    currentHelperText = '入力は必須です。';
  } else if (currentValue !== '') {
    const patternStr = props.allowDecimal ? `^-?\\d*(\\.\\d*)?$` : `^-?\\d*$`;
    const isValidNumericFormat = new RegExp(patternStr).test(currentValue);

    if (!isValidNumericFormat) {
      currentHelperText = props.allowDecimal
        ? '有効な半角数字、小数点、マイナス記号のみが許容されます。'
        : '有効な半角整数、マイナス記号のみが許容されます。';
    } else {
      const isInputInProgress = currentValue === '-' ||
                             (props.allowDecimal && (currentValue === '.' || currentValue === '-.'));

      if (!isInputInProgress) {
        const numValue = Number(currentValue);
        if (isNaN(numValue)) {
          currentHelperText = '有効な半角数字を入力してください。';
        } else {
          if (props.allowDecimal && props.decimalPlaces !== null) {
            const parts = currentValue.split('.');
            if (parts.length > 1 && parts[1].length > props.decimalPlaces) {
              currentHelperText = `小数点以下は${props.decimalPlaces}桁までです。`;
            }
          }
          if (currentHelperText === '') {
            if (props.min !== null && numValue < props.min) {
              currentHelperText = `${props.min}以上の値を入力してください。`;
            }
            if (props.max !== null && numValue > props.max) {
              currentHelperText = `${props.max}以下の値を入力してください。`;
            }
          }
        }
      }
    }
  }
  internalHelperText.value = currentHelperText;
  return !!currentHelperText;
};

const handleInternalBlur = () => {
  if (!isComposing.value) { // IME入力中でなければ実行
    const currentValue = internalValue.value;
    const hasErrorFromValidation = validateAndSetError(currentValue);

    if (!hasErrorFromValidation && props.allowDecimal && props.decimalPlaces !== null) {
      const numValue = Number(currentValue);
      if (!isNaN(numValue) && currentValue !== '' && currentValue !== '-' && currentValue !== '.') {
        const roundedValue = numValue.toFixed(props.decimalPlaces);
        if (roundedValue !== currentValue) {
          internalValue.value = roundedValue;
          emit('update:value', roundedValue);
          validateAndSetError(roundedValue);
        }
      }
    }
  }
};

const handleInternalChange = (inputValue) => {
  if (isComposing.value) {
    internalValue.value = inputValue;
  } else {
    const normalizedValue = normalizeAndRemoveCommas(inputValue);
    internalValue.value = normalizedValue;
    validateAndSetError(normalizedValue);
    emit('update:value', normalizedValue);
  }
};

const handleCompositionEnd = (event) => {
  isComposing.value = false;
  // IME確定後、v-text-fieldから`update:model-value`が発行されるため、
  // ブラウザやIMEによるイベント順序の差異を吸収するために手動でハンドラを呼び出します。
  handleInternalChange(event.target.value);
};

// --- Watchers ---
watch(
  () => props.value,
  (newVal) => {
    if (!isComposing.value) {
      const normalized = normalizeAndRemoveCommas(newVal);
      if (normalized !== internalValue.value) {
        // 親から値が変更された場合、内部状態を更新する
        internalValue.value = normalized;
        validateAndSetError(normalized);
      }
    }
  }
);

// --- Lifecycle Hooks ---
onMounted(() => {
  // マウント時に初期値のバリデーションを実行
  validateAndSetError(internalValue.value);
});
</script>
