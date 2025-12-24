import { Group, Box, Tooltip, UnstyledButton, rem } from "@mantine/core";
import { IconDownload, IconId, IconActivity, IconServer } from "@tabler/icons-react";
import { useState } from "react";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const [hovered, setHovered] = useState(false);

  const tabs = [
    { id: 'downloader', label: 'Downloader', icon: IconDownload },
    { id: 'extractor', label: 'ID Extractor', icon: IconId },
    { id: 'tracker', label: 'Live Tracker', icon: IconActivity },
    { id: 'proxies', label: 'Proxies', icon: IconServer },
  ];

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px", // Expandable hover area
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end", // Align to bottom
        paddingBottom: "10px",
      }}
    >
      <Group
        gap="xs"
        style={{
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "8px 16px",
          borderRadius: "30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Tooltip key={tab.id} label={tab.label} withArrow position="top">
              <UnstyledButton
                onClick={() => onTabChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#000' : 'transparent',
                  color: isActive ? '#fff' : '#666',
                  transition: 'all 0.2s ease',
                }}
              >
                <tab.icon style={{ width: rem(20), height: rem(20) }} stroke={2} />
              </UnstyledButton>
            </Tooltip>
          );
        })}
      </Group>
    </Box>
  );
}
