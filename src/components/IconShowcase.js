import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip } from 'react-native-paper';
import { SportIcons, AppIcons, FeatherIcons, IonIcons, Icon } from './Icons';

export default function IconShowcase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const iconCategories = [
    {
      name: 'Sports',
      icons: SportIcons,
      color: '#FF6B35'
    },
    {
      name: 'App',
      icons: AppIcons,
      color: '#337f35'
    },
    {
      name: 'Feather',
      icons: FeatherIcons,
      color: '#2196F3'
    },
    {
      name: 'Ionicons',
      icons: IonIcons,
      color: '#9C27B0'
    }
  ];

  const categories = ['All', ...iconCategories.map(cat => cat.name)];

  const getFilteredIcons = () => {
    let allIcons = [];
    
    iconCategories.forEach(category => {
      if (selectedCategory === 'All' || selectedCategory === category.name) {
        Object.entries(category.icons).forEach(([name, IconComponent]) => {
          if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
            allIcons.push({
              name,
              component: IconComponent,
              category: category.name,
              color: category.color
            });
          }
        });
      }
    });
    
    return allIcons;
  };

  const renderIcon = (iconData) => (
    <TouchableOpacity key={`${iconData.category}-${iconData.name}`} style={styles.iconItem}>
      <View style={[styles.iconContainer, { backgroundColor: iconData.color }]}>
        <iconData.component size={24} color="white" />
      </View>
      <Text style={styles.iconName}>{iconData.name}</Text>
      <Text style={styles.iconCategory}>{iconData.category}</Text>
    </TouchableOpacity>
  );

  const filteredIcons = getFilteredIcons();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Icon Showcase</Text>
      
      {/* Search */}
      <Searchbar
        placeholder="Search icons..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        {categories.map(category => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category && styles.selectedChipText
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>
      
      {/* Icons Grid */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.iconsGrid}>
          {filteredIcons.map(renderIcon)}
        </View>
        
        {filteredIcons.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No icons found</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Usage Example */}
      <Card style={styles.exampleCard}>
        <Card.Content>
          <Text style={styles.exampleTitle}>Usage Examples:</Text>
          <Text style={styles.exampleCode}>
            {`import { SportIcons, AppIcons, FeatherIcons } from './components/Icons';

// Using pre-configured icons
<SportIcons.Cricket size={24} color="#FF6B35" />
<AppIcons.Home size={20} color="#337f35" />
<FeatherIcons.Heart size={18} color="#F44336" />

// Using generic Icon component
<Icon family="MaterialIcons" name="home" size={24} color="#000" />`}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  selectedChip: {
    backgroundColor: '#337f35',
  },
  chipText: {
    color: '#666',
  },
  selectedChipText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  iconCategory: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  exampleCard: {
    marginTop: 16,
    backgroundColor: '#F0F0F0',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exampleCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#337f35',
  },
});