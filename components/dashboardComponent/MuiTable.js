import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import diffrenceTime from '@/utils/formateDate/diffrenceTime';

const columns = [
  { id: 'id', label: 'Id', minWidth: 10 },
  { id: 'model', label: 'Model', minWidth: 100 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'createdAt',
    label: 'Time',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'cost',
    label: 'Credit Used',
    minWidth: 100,
    align: 'center',
    format: (value) => {
      if (value === 0) return 'Free';
      if (value === null || value === undefined) return 'Free';
      if (typeof value === 'number') return value.toString();
      return value.toString();
    },
  },
];

export default function MuiTable({ userHistory }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Sort userHistory by createdAt in descending order
  const sortedUserHistory = [...userHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const newDataAfterDateFormat = sortedUserHistory.map((item, idx) => {
    const diffrenceInTime = diffrenceTime(item.createdAt);
    let model;
    if (item.model === "tencentarc/gfpgan") {
      model = "Restore Photos";
    } else if (item.model === "allenhooo/lama") {
      model = "Remove Objects";
    } else if (item.model === "home-designer") {
      model = "Home Designer";
    } else if (item.model === "cjwbw/rembg") {
      model = "Background Removal";
    } else if (item.model === "hair-style") {
      model = "Hair Style";
    }else if (item.model === "generate-image") {
      model = "Generate Image";
    } else if (item.model === "combine-image") {
      model = "Combine Image";
    } else if (item.model === "text-removal") {
      model = "Remove Text";
    } else if (item.model === "headshot") {
      model = "Headshot";
    } else if (item.model === "restore-image") {
      model = "Restore Image";
    } else if (item.model === "gfp-restore") {
      model = "Restore Image (Free)";
    } else if (item.model === "edit-image") {
      model = "Edit Image";
    }
    else {
      model = item.model;
    }
    return { ...item, createdAt: diffrenceInTime, model: model, id: idx + 1, cost: item.cost || 0 };
  });

  const [rows, setRows] = React.useState(newDataAfterDateFormat);

  const handleChangePage = ( newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : column.format 
                              ? column.format(value)
                              : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 15, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
