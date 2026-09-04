import React, { useState } from 'react';
import { View, StyleSheet, Text } from '@/web/primitives';
import { useNavigation } from '@/web/navigation';
import { NativeStackNavigationProp } from '@/web/navigation';
import { useIssueHistory, useKitchens } from '../hooks/useKitchenIssues';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import TableToolbar from '../../../shared/components/table/TableToolbar';
import Drawer from '../../../shared/components/ui/Drawer';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Button from '../../../shared/components/ui/Button';
import { KitchenIssue } from '../../../shared/mock/mockDb';
import { formatDate } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/constants/routes';
import { KitchenIssueStackParamList } from '../../../app/navigation/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';

type NavigationProp = NativeStackNavigationProp<KitchenIssueStackParamList>;

export const IssueHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: kitchensData = [] } = useKitchens();

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 400);

  const [section, setSection] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer
  const [selectedIssue, setSelectedIssue] = useState<KitchenIssue | null>(null);

  const { data, isLoading } = useIssueHistory({
    page,
    pageSize,
    search: debouncedSearch,
    section,
    startDate,
    endDate,
  });

  const hasActiveFilters = !!(section || startDate || endDate);

  const handleClearFilters = () => {
    setSection('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const columns: Column<KitchenIssue>[] = [
    {
      key: 'date',
      title: 'Issue Date',
      flex: 1.5,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date)}</Text>,
    },
    { key: 'issuedToSection', title: 'Issued To Kitchen Section', flex: 2 },
    { key: 'issuedBy', title: 'Issued By', flex: 1.5 },
    {
      key: 'itemCount',
      title: 'Unique Items',
      flex: 1,
      align: 'center',
      render: (item) => <Text style={{ color: colors.text }}>{item.items.length}</Text>,
    },
  ];

  const sectionOptions = [
    { label: 'All Sections', value: '' },
    ...kitchensData.map((k) => ({ label: k.name, value: k.name })),
  ];

  return (
    <ScreenContainer title="Kitchen Stock Issues">
      <View style={styles.content}>
        <PageHeader
          title="Kitchen Dispatch History"
          subtitle="View records of inventory dispatched and issued to various kitchen sections"
          primaryAction={{
            title: 'Dispatch New Stock',
            onPress: () => navigation.navigate(ROUTES.KITCHEN_ISSUE_SCREENS.CREATE as any),
          }}
        />

        <TableToolbar
          searchValue={searchValue}
          onSearchChange={(val) => {
            setSearchValue(val);
            setPage(1);
          }}
          searchPlaceholder="Search by section or product..."
          filterOpen={filtersOpen}
          onToggleFilter={() => setFiltersOpen(!filtersOpen)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        {filtersOpen && (
          <View style={[styles.filterPanel, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
            <View style={styles.filterRow}>
              <View style={styles.filterCol}>
                <Select
                  label="Kitchen Section"
                  options={sectionOptions}
                  selectedValue={section}
                  onValueChange={(val) => { setSection(val); setPage(1); }}
                />
              </View>
              <View style={styles.filterCol}>
                <DatePicker
                  label="From Date"
                  value={startDate}
                  onChange={(d) => { setStartDate(d); setPage(1); }}
                />
              </View>
              <View style={styles.filterCol}>
                <DatePicker
                  label="To Date"
                  value={endDate}
                  onChange={(d) => { setEndDate(d); setPage(1); }}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.tableWrapper}>
          <DataTable
            data={data?.data || []}
            columns={columns}
            loading={isLoading}
            onRowPress={(item) => setSelectedIssue(item)}
            emptyText="No dispatch entries found."
          />
        </View>

        <TablePagination
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount || 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </View>

      {/* Slide-out details drawer */}
      <Drawer
        visible={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title={`Kitchen Dispatch: ${selectedIssue?.id}`}
      >
        {selectedIssue && (
          <View style={styles.drawerDetails}>
            <View style={styles.drawerSummary}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dispatched To</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '600' }]}>
                  {selectedIssue.issuedToSection}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Issued By</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{selectedIssue.issuedBy}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date Logged</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(selectedIssue.date)}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients List</Text>
            
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
              <Text style={[styles.colName, { color: colors.textSecondary }]}>Ingredient</Text>
              <Text style={[styles.colQty, { color: colors.textSecondary }]}>Issued Qty</Text>
            </View>

            {selectedIssue.items.map((item, idx) => (
              <View key={`${item.productId}-${idx}`} style={[styles.tableItemRow, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.cellName, { color: colors.text }]} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={[styles.cellQty, { color: colors.text, fontWeight: '600' }]}>
                  {item.quantity}
                </Text>
              </View>
            ))}

            {selectedIssue.notes ? (
              <View style={styles.notesBox}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes / Remarks</Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{selectedIssue.notes}</Text>
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={{ gap: spacing.sm }}>
              <Button
                title="View Full Dispatch Record"
                onPress={() => {
                  const issueId = selectedIssue.id;
                  setSelectedIssue(null);
                  navigation.navigate(ROUTES.KITCHEN_ISSUE_SCREENS.DETAILS as any, { id: issueId });
                }}
              />
              <Button
                title="Close Details"
                onPress={() => setSelectedIssue(null)}
                variant="outline"
              />
            </View>
          </View>
        )}
      </Drawer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    flex: 1,
  },
  filterPanel: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  filterCol: {
    flex: 1,
    minWidth: 180,
  },
  tableWrapper: {
    flex: 1,
    marginTop: spacing.sm,
  },
  drawerDetails: {
    gap: spacing.md,
  },
  drawerSummary: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  colName: { flex: 3, fontSize: 11, fontWeight: '600' },
  colQty: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  
  tableItemRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cellName: { flex: 3, fontSize: 12 },
  cellQty: { flex: 1, fontSize: 12, textAlign: 'right' },
  
  notesBox: {
    marginTop: spacing.sm,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default IssueHistoryScreen;
