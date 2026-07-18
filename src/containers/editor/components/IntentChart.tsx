import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'

type IntentBar = { label: string; value: number }

type IntentChartProps = {
  bars: IntentBar[]
}

export default function IntentChart({ bars }: IntentChartProps) {
  return (
    <Stack gap="md">
      {bars.map((bar) => (
        <Stack key={bar.label} gap="none" className="w-full ">
          <Stack direction="horizontal" align="center">
            <Text variant="caption" weight="semibold">
              {bar.label}
            </Text>
            <Text variant="caption" color="secondary">
              {bar.value}%
            </Text>
          </Stack>
          <div className="h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-linear-to-r! from-brand to-accent"
              style={{ width: `${bar.value}%` }}
            />
          </div>
        </Stack>
      ))}
    </Stack>
  )
}
